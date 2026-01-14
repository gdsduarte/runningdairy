/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
/**
 * Cloud Functions for Running Diary App
 * Handles email notifications for join requests and approvals
 */

// Load environment variables from .env file
require("dotenv").config();

const {setGlobalOptions} = require("firebase-functions");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Import utilities and services
const {sanitizeInput, validateEmail, validateEmails} = require("./utils/validation");
const {enforceRateLimit} = require("./utils/rateLimit");
const {requireAuth, verifyClubAdmin, getClubAdminEmails} = require("./utils/permissions");
const {sendEmail, getAppUrl} = require("./services/emailService");
const {getJoinRequestTemplate, getApprovalConfirmationTemplate} = require("./utils/emailTemplates");

// Initialize Firebase Admin
admin.initializeApp();

setGlobalOptions({maxInstances: 10});

/**
 * Send join request notification to club admins
 * Notifies all admins when a new user requests to join the club
 */
exports.sendJoinRequestNotification = onCall(
    {
      cors: true,
    },
    async (request) => {
      try {
        // 1. Authentication check
        const uid = requireAuth(request.auth);

        // 2. Rate limiting
        enforceRateLimit(uid);

        const {clubId, userName, userEmail} = request.data;

        // 3. Input validation
        if (!clubId || !userName || !userEmail) {
          throw new HttpsError("invalid-argument", "Missing required parameters");
        }

        // 4. Input sanitization
        const sanitizedClubId = sanitizeInput(clubId, 100);
        const sanitizedUserName = sanitizeInput(userName, 100);
        const sanitizedUserEmail = validateEmail(userEmail);

        // 5. Get club information
        const clubDoc = await admin
            .firestore()
            .collection("clubs")
            .doc(sanitizedClubId)
            .get();

        if (!clubDoc.exists) {
          throw new HttpsError("not-found", "Club not found");
        }

        const clubData = clubDoc.data();
        const clubName = sanitizeInput(clubData.name || "Running Club", 100);

        // 6. Get admin emails
        const adminEmails = await getClubAdminEmails(sanitizedClubId);

        if (adminEmails.length === 0) {
          logger.warn("No admin emails found for club", {clubId: sanitizedClubId});
          throw new HttpsError("failed-precondition", "No admins found for this club");
        }

        // 7. Generate email
        const appUrl = getAppUrl();
        const emailHtml = getJoinRequestTemplate(
            sanitizedUserName,
            sanitizedUserEmail,
            clubName,
            appUrl,
        );

        // 8. Send email to all admins
        const result = await sendEmail(
            adminEmails,
            `New Join Request for ${clubName}`,
            emailHtml,
            clubName,
        );

        logger.info("Join request notification sent", {
          messageId: result.messageId,
          clubId: sanitizedClubId,
          requestedBy: uid,
        });

        return {
          success: true,
          message: `Notification sent to ${adminEmails.length} admin(s)`,
          emailId: result.messageId,
        };
      } catch (error) {
        logger.error("Error in sendJoinRequestNotification", {
          error: error.message,
          code: error.code,
        });

        if (error.constructor.name === "HttpsError") {
          throw error;
        }

        throw new HttpsError("internal", `Failed to send notification: ${error.message}`);
      }
    },
);

/**
 * Send approval confirmation to new member
 * Notifies the member when their join request is approved
 */
exports.sendApprovalConfirmation = onCall(
    {
      cors: true,
    },
    async (request) => {
      try {
        // 1. Authentication check
        const uid = requireAuth(request.auth);

        // 2. Rate limiting
        enforceRateLimit(uid);

        const {clubId, memberEmail, memberName} = request.data;

        // 3. Input validation
        if (!clubId || !memberEmail || !memberName) {
          throw new HttpsError("invalid-argument", "Missing required parameters");
        }

        // 4. Input sanitization
        const sanitizedClubId = sanitizeInput(clubId, 100);
        const sanitizedMemberEmail = validateEmail(memberEmail);
        const sanitizedMemberName = sanitizeInput(memberName, 100);

        // 5. Permission check - verify sender is admin
        const hasPermission = await verifyClubAdmin(uid, sanitizedClubId);
        if (!hasPermission) {
          throw new HttpsError(
              "permission-denied",
              "Only club admins can approve members",
          );
        }

        // 6. Get club and approver information
        const [clubDoc, approverDoc] = await Promise.all([
          admin.firestore().collection("clubs").doc(sanitizedClubId).get(),
          admin.firestore().collection("users").doc(uid).get(),
        ]);

        if (!clubDoc.exists) {
          throw new HttpsError("not-found", "Club not found");
        }

        const clubData = clubDoc.data();
        const clubName = sanitizeInput(clubData.name || "Running Club", 100);

        const approverData = approverDoc.exists ? approverDoc.data() : {};
        const approvedBy = approverData.displayName || approverData.name || "Admin";

        // 7. Generate email
        const appUrl = getAppUrl();
        const emailHtml = getApprovalConfirmationTemplate(
            sanitizedMemberName,
            clubName,
            approvedBy,
            appUrl,
        );

        // 8. Send email
        const result = await sendEmail(
            sanitizedMemberEmail,
            `Welcome to ${clubName}!`,
            emailHtml,
            clubName,
        );

        logger.info("Approval confirmation sent", {
          messageId: result.messageId,
          clubId: sanitizedClubId,
          approvedBy: uid,
          memberEmail: sanitizedMemberEmail,
        });

        return {
          success: true,
          message: `Approval confirmation sent to ${sanitizedMemberEmail}`,
          emailId: result.messageId,
        };
      } catch (error) {
        logger.error("Error in sendApprovalConfirmation", {
          error: error.message,
          code: error.code,
        });

        if (error.constructor.name === "HttpsError") {
          throw error;
        }

        throw new HttpsError("internal", `Failed to send confirmation: ${error.message}`);
      }
    },
);
