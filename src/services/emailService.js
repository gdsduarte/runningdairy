import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

/**
 * Send join request notification to club admins via Firebase Cloud Function
 * @param {Array<string>} adminEmails - Array of admin email addresses
 * @param {string} userName - Name of the user requesting to join
 * @param {string} userEmail - Email of the user requesting to join
 * @param {string} clubName - Name of the club
 * @param {string} requestId - Join request ID
 */
export const sendJoinRequestNotification = async (adminEmails, userName, userEmail, clubName, requestId) => {
  try {
    // Call the Firebase Cloud Function
    const sendEmail = httpsCallable(functions, 'sendJoinRequestNotification');
    
    const result = await sendEmail({
      adminEmails,
      userName,
      userEmail,
      clubName,
      requestId,
    });

    console.log('Join request notification sent successfully:', result.data);

    return {
      success: true,
      message: result.data.message,
      emailId: result.data.emailId,
    };
  } catch (error) {
    console.error('Error sending join request notification:', error);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send join request notification';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'You do not have permission to send notifications';
    } else if (error.code === 'unauthenticated') {
      errorMessage = 'You must be logged in to send notifications';
    } else if (error.code === 'resource-exhausted') {
      errorMessage = 'Rate limit exceeded. Please try again later';
    } else if (error.code === 'invalid-argument') {
      errorMessage = error.message || 'Invalid notification data';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Send approval confirmation email to new member via Firebase Cloud Function
 * @param {string} email - Member email
 * @param {string} displayName - Member name
 * @param {string} clubName - Name of the club
 * @param {string} approvedBy - Name of the admin who approved
 */
export const sendApprovalConfirmation = async (email, displayName, clubName, approvedBy) => {
  try {
    // Call the Firebase Cloud Function
    const sendEmail = httpsCallable(functions, 'sendApprovalConfirmation');
    
    const result = await sendEmail({
      email,
      displayName,
      clubName,
      approvedBy,
    });

    console.log('Approval confirmation sent successfully:', result.data);

    return {
      success: true,
      message: result.data.message,
      emailId: result.data.emailId,
    };
  } catch (error) {
    console.error('Error sending approval confirmation:', error);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send approval confirmation';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'You do not have permission to send confirmations';
    } else if (error.code === 'unauthenticated') {
      errorMessage = 'You must be logged in to send confirmations';
    } else if (error.code === 'resource-exhausted') {
      errorMessage = 'Rate limit exceeded. Please try again later';
    } else if (error.code === 'invalid-argument') {
      errorMessage = error.message || 'Invalid confirmation data';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 */
export const sendPasswordReset = async (email) => {
  try {
    const { getAuth } = await import('firebase/auth');
    const { sendPasswordResetEmail } = await import('firebase/auth');
    const auth = getAuth();
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset:', error);
    return { success: false, error: error.message };
  }
};
