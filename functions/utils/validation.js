const {HttpsError} = require("firebase-functions/v2/https");

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
 * Validate and sanitize email address
 * @param {string} email - Email address
 * @return {string} - Sanitized email
 */
function validateEmail(email) {
  if (!email) {
    throw new HttpsError("invalid-argument", "Email is required");
  }

  const sanitized = email.toLowerCase().trim();

  if (!isValidEmail(sanitized)) {
    throw new HttpsError("invalid-argument", "Invalid email address format");
  }

  return sanitized;
}

/**
 * Validate array of emails
 * @param {Array<string>} emails - Array of email addresses
 * @return {Array<string>} - Array of sanitized emails
 */
function validateEmails(emails) {
  if (!Array.isArray(emails) || emails.length === 0) {
    throw new HttpsError("invalid-argument", "Valid email array is required");
  }

  if (emails.length > 10) {
    throw new HttpsError("invalid-argument", "Maximum 10 recipients allowed");
  }

  return emails.map(validateEmail);
}

module.exports = {
  sanitizeInput,
  isValidEmail,
  validateEmail,
  validateEmails,
};
