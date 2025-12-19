/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
/**
 * Cloud Functions for Running Diary App
 * Handles email sending via Gmail SMTP with security controls
 */

// Load environment variables from .env file
require("dotenv").config();

const functions = require("firebase-functions");
const {setGlobalOptions} = require("firebase-functions");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

setGlobalOptions({maxInstances: 10});

// Lazy initialize email transporter
let transporter = null;
function getTransporter() {
  if (!transporter) {
    // Try environment variables first (local .env), then Firebase config (production)
    const gmailUser =
      process.env.GMAIL_USER ||
      (functions.config().gmail && functions.config().gmail.user);
    const gmailPassword =
      process.env.GMAIL_APP_PASSWORD ||
      (functions.config().gmail && functions.config().gmail.password);

    if (!gmailUser || !gmailPassword) {
      throw new HttpsError(
          "failed-precondition",
          "Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.",
      );
    }

    // Check if running in emulator (development)
    const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";

    const transportConfig = {
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    };

    // In emulator, disable certificate validation to avoid self-signed cert errors
    if (isEmulator) {
      transportConfig.tls = {
        rejectUnauthorized: false,
      };
      logger.info("Running in emulator mode - TLS certificate validation disabled");
    }

    transporter = nodemailer.createTransport(transportConfig);
  }
  return transporter;
}

// Rate limiting cache (in production, use Redis or Firestore)
const emailRateLimits = new Map();

/**
 * Check rate limit for user
 * @param {string} uid - User ID
 * @return {boolean} - Whether user is within rate limit
 */
function checkRateLimit(uid) {
  const now = Date.now();
  const userLimit = emailRateLimits.get(uid) || {
    count: 0,
    resetAt: now + 3600000,
  }; // 1 hour window

  // Reset if time window expired
  if (now > userLimit.resetAt) {
    userLimit.count = 0;
    userLimit.resetAt = now + 3600000;
  }

  // Check limit (10 emails per hour per user)
  if (userLimit.count >= 10) {
    return false;
  }

  userLimit.count++;
  emailRateLimits.set(uid, userLimit);
  return true;
}

/**
 * Sanitize input string to prevent injection attacks
 * @param {string} input - Input string
 * @param {number} maxLength - Maximum allowed length
 * @return {string} - Sanitized string
 */
function sanitizeInput(input, maxLength = 200) {
  if (typeof input !== "string") {
    throw new HttpsError("invalid-argument", "Input must be a string");
  }

  // Remove any HTML tags and trim
  const sanitized = input
      .replace(/<[^>]*>/g, "")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, maxLength);

  if (!sanitized) {
    throw new HttpsError(
        "invalid-argument",
        "Input cannot be empty after sanitization",
    );
  }

  return sanitized;
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @return {boolean} - Whether email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Verify user has admin/moderator role in the club
 * @param {string} uid - User ID
 * @param {string} invitationToken - Invitation token
 * @return {Promise<boolean>} - Whether user has permission
 */
async function verifyUserPermission(uid, invitationToken) {
  try {
    // Get the invitation document to find the clubId
    const invitationDoc = await admin
        .firestore()
        .collection("invitations")
        .doc(invitationToken)
        .get();

    if (!invitationDoc.exists) {
      logger.warn("Invitation not found", {invitationToken});
      return false;
    }

    const invitationData = invitationDoc.data();
    const actualClubId = invitationData.clubId;

    if (!actualClubId) {
      logger.warn("No clubId in invitation", {invitationToken});
      return false;
    }

    // Get user document
    const userDoc = await admin.firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      logger.warn("User not found", {uid});
      return false;
    }

    const userData = userDoc.data();
    const userClubId = userData.clubId;
    const userRole = userData.role;

    // User must be in the same club and have admin or moderator role
    if (userClubId !== actualClubId) {
      logger.warn("User not authorized for this club", {
        uid,
        userClubId,
        actualClubId,
      });
      return false;
    }

    return userRole === "admin" || userRole === "moderator";
  } catch (error) {
    logger.error("Error verifying user permission", {error: error.message});
    return false;
  }
}

/**
 * Send invitation email to new club member
 * Callable function from client app with security controls
 */
exports.sendInvitationEmail = onCall(
    {
      cors: true, // Enable CORS for all origins
    },
    async (request) => {
    // 1. AUTHENTICATION CHECK
      if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "User must be authenticated to send invitations",
        );
      }

      const uid = request.auth.uid;

      // 2. RATE LIMITING
      if (!checkRateLimit(uid)) {
        throw new HttpsError(
            "resource-exhausted",
            "Rate limit exceeded. Maximum 10 invitations per hour.",
        );
      }

      const {email, displayName, invitationToken, clubName} = request.data;

      // 3. INPUT VALIDATION
      if (!email || !displayName || !invitationToken || !clubName) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      // 4. INPUT SANITIZATION
      const sanitizedEmail = email.toLowerCase().trim();
      const sanitizedDisplayName = sanitizeInput(displayName, 100);
      const sanitizedClubName = sanitizeInput(clubName, 100);
      const sanitizedToken = sanitizeInput(invitationToken, 150);

      // 5. EMAIL VALIDATION
      if (!isValidEmail(sanitizedEmail)) {
        throw new HttpsError("invalid-argument", "Invalid email address format");
      }

      // 6. PERMISSION CHECK
      const hasPermission = await verifyUserPermission(uid, sanitizedToken);
      if (!hasPermission) {
        throw new HttpsError(
            "permission-denied",
            "User does not have permission to send invitations for this club",
        );
      }

      // 7. CONSTRUCT INVITATION LINK (use sanitized token)
      const appUrl =
      process.env.APP_URL ||
      (functions.config().app && functions.config().app.url) ||
      "http://localhost:3000";
      const invitationLink = `${appUrl}/setup-account?token=${sanitizedToken}`;

      // 8. BUILD EMAIL HTML (use sanitized values)
      const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          background: #6366f1;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .link-box {
          word-break: break-all;
          background: white;
          padding: 10px;
          border-radius: 5px;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏃 Welcome to ${sanitizedClubName}!</h1>
        </div>
        <div class="content">
          <p>Hi ${sanitizedDisplayName},</p>
          <p>You've been invited to join <strong>${sanitizedClubName}</strong> running club! We're excited to have you join our community of runners.</p>
          <p>To complete your registration and set up your account, please click the button below:</p>
          <p style="text-align: center;">
            <a href="${invitationLink}" class="button">Set Up My Account</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p class="link-box">${invitationLink}</p>
          <p><strong>This invitation will expire in 7 days.</strong></p>
          <p>Looking forward to running with you!</p>
          <p>Best regards,<br>The ${sanitizedClubName} Team</p>
        </div>
        <div class="footer">
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

      // 9. SEND EMAIL VIA GMAIL
      try {
        const emailTransporter = getTransporter();

        const gmailUser =
        process.env.GMAIL_USER ||
        (functions.config().gmail && functions.config().gmail.user);

        const mailOptions = {
          from: `"${sanitizedClubName}" <${gmailUser}>`,
          to: sanitizedEmail,
          subject: `You're invited to join ${sanitizedClubName}!`,
          html: emailHtml,
        };

        const result = await emailTransporter.sendMail(mailOptions);

        if (!result.messageId) {
          logger.error("No message ID returned", {email: sanitizedEmail});
          throw new HttpsError(
              "internal",
              "Email service did not return confirmation ID",
          );
        }

        logger.info("Invitation email sent", {
          messageId: result.messageId,
          to: sanitizedEmail,
          sentBy: uid,
        });

        return {
          success: true,
          message: `Invitation email sent to ${sanitizedEmail}`,
          emailId: result.messageId,
        };
      } catch (error) {
        logger.error("Error sending email", {
          error: error.message,
          email: sanitizedEmail,
        });

        // Re-throw HttpsError as-is
        if (error.constructor.name === "HttpsError") {
          throw error;
        }

        throw new HttpsError(
            "internal",
            `Failed to send email: ${error.message}`,
        );
      }
    },
);
