const functions = require("firebase-functions");
const { HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");

// Lazy initialize email transporter
let transporter = null;

/**
 * Get or create email transporter
 * @return {object} - Nodemailer transporter
 */
function getTransporter() {
  if (!transporter) {
    // Try environment variables first (local .env), then Firebase config (production)
    const gmailUser =
      process.env.GMAIL_USER ||
      (functions.config().gmail && functions.config().gmail.user);
    const gmailPassword =
      process.env.GMAIL_APP_PASSWORD ||
      (functions.config().gmail && functions.config().gmail.password);

    logger.info("Initializing email transporter", {
      hasGmailUser: !!gmailUser,
      hasGmailPassword: !!gmailPassword,
      gmailUserSource: process.env.GMAIL_USER ? "env" : "config",
    });

    if (!gmailUser || !gmailPassword) {
      throw new HttpsError(
          "failed-precondition",
          "Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.",
      );
    }

    // Check if running in emulator (development)
    // Multiple ways to detect emulator environment
    const isEmulator =
      process.env.FUNCTIONS_EMULATOR === "true" ||
      process.env.FIREBASE_CONFIG === undefined ||
      (process.env.K_SERVICE === undefined &&
        process.env.FUNCTION_TARGET === undefined);

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
      logger.info(
          "Running in emulator mode - TLS certificate validation disabled",
          {
            FUNCTIONS_EMULATOR: process.env.FUNCTIONS_EMULATOR,
            FIREBASE_CONFIG: process.env.FIREBASE_CONFIG ? "set" : "not set",
            K_SERVICE: process.env.K_SERVICE ? "set" : "not set",
          },
      );
    } else {
      logger.info("Running in production mode - Full TLS validation enabled");
    }

    transporter = nodemailer.createTransport(transportConfig);
  }
  return transporter;
}

/**
 * Get Gmail user email
 * @return {string} - Gmail user email
 */
function getGmailUser() {
  return (
    process.env.GMAIL_USER ||
    (functions.config().gmail && functions.config().gmail.user)
  );
}

/**
 * Get application URL
 * @return {string} - Application URL
 */
function getAppUrl() {
  return (
    process.env.APP_URL ||
    (functions.config().app && functions.config().app.url) ||
    "http://localhost:3000"
  );
}

/**
 * Send email
 * @param {string} to - Recipient email or array of emails
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @param {string} fromName - Sender name
 * @return {Promise<object>} - Result object with success and messageId
 */
async function sendEmail(to, subject, html, fromName = "Running Diary") {
  try {
    logger.info("Attempting to send email", { to, subject });

    const emailTransporter = getTransporter();
    const gmailUser = getGmailUser();

    const mailOptions = {
      from: `"${fromName}" <${gmailUser}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    };

    logger.info("Sending email with nodemailer", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const result = await emailTransporter.sendMail(mailOptions);

    if (!result.messageId) {
      logger.error("No message ID returned", { to });
      throw new HttpsError(
          "internal",
          "Email service did not return confirmation ID",
      );
    }

    logger.info("Email sent successfully", {
      messageId: result.messageId,
      to,
      subject,
    });

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    logger.error("Error sending email", {
      error: error.message,
      errorCode: error.code,
      errorStack: error.stack,
      to,
      subject,
    });

    // Re-throw HttpsError as-is
    if (error.constructor.name === "HttpsError") {
      throw error;
    }

    throw new HttpsError("internal", `Failed to send email: ${error.message}`);
  }
}

module.exports = {
  getTransporter,
  getGmailUser,
  getAppUrl,
  sendEmail,
};
