const {HttpsError} = require("firebase-functions/v2/https");

// Rate limiting cache (in production, use Redis or Firestore)
const emailRateLimits = new Map();

/**
 * Check rate limit for user
 * @param {string} uid - User ID
 * @param {number} maxEmails - Maximum emails per hour
 * @return {boolean} - Whether user is within rate limit
 */
function checkRateLimit(uid, maxEmails = 10) {
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

  // Check limit
  if (userLimit.count >= maxEmails) {
    return false;
  }

  userLimit.count++;
  emailRateLimits.set(uid, userLimit);
  return true;
}

/**
 * Enforce rate limit for user
 * @param {string} uid - User ID
 * @param {number} maxEmails - Maximum emails per hour
 * @throws {HttpsError} - If rate limit exceeded
 */
function enforceRateLimit(uid, maxEmails = 10) {
  if (!checkRateLimit(uid, maxEmails)) {
    throw new HttpsError(
        "resource-exhausted",
        `Rate limit exceeded. Maximum ${maxEmails} emails per hour.`,
    );
  }
}

module.exports = {
  checkRateLimit,
  enforceRateLimit,
};
