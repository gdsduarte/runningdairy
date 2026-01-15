const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

/**
 * Verify user has admin/moderator role in the club
 * @param {string} uid - User ID
 * @param {string} clubId - Club ID
 * @return {Promise<boolean>} - Whether user has permission
 */
async function verifyClubAdmin(uid, clubId) {
  try {
    // Get user document
    const userDoc = await admin.firestore().collection("users").doc(uid).get();

    if (!userDoc.exists) {
      logger.warn("User not found", { uid });
      return false;
    }

    const userData = userDoc.data();
    const userClubId = userData.clubId;
    const userRole = userData.role;

    // User must be in the same club and have admin or moderator role
    if (userClubId !== clubId) {
      logger.warn("User not authorized for this club", {
        uid,
        userClubId,
        clubId,
      });
      return false;
    }

    return userRole === "admin" || userRole === "moderator";
  } catch (error) {
    logger.error("Error verifying club admin", { error: error.message });
    return false;
  }
}

/**
 * Get all admin emails for a club
 * @param {string} clubId - Club ID
 * @return {Promise<Array<string>>} - Array of admin emails
 */
async function getClubAdminEmails(clubId) {
  try {
    const usersSnapshot = await admin
        .firestore()
        .collection("users")
        .where("clubId", "==", clubId)
        .where("role", "in", ["admin", "moderator"])
        .get();

    const adminEmails = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.email) {
        adminEmails.push(userData.email);
      }
    });

    return adminEmails;
  } catch (error) {
    logger.error("Error getting admin emails", {
      error: error.message,
      clubId,
    });
    return [];
  }
}

/**
 * Verify user is authenticated
 * @param {object} auth - Firebase auth context
 * @return {string} - User ID
 * @throws {Error} - If not authenticated
 */
function requireAuth(auth) {
  if (!auth) {
    throw new Error("User must be authenticated");
  }
  return auth.uid;
}

module.exports = {
  verifyClubAdmin,
  getClubAdminEmails,
  requireAuth,
};
