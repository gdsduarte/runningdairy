import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

/**
 * Send invitation email to new member via Firebase Cloud Function
 * @param {string} email - Recipient email
 * @param {string} displayName - Recipient name
 * @param {string} invitationToken - Invitation token/ID
 * @param {string} clubName - Name of the club
 */
export const sendInvitationEmail = async (email, displayName, invitationToken, clubName) => {
  try {
    // Call the Firebase Cloud Function
    const sendEmail = httpsCallable(functions, 'sendInvitationEmail');
    
    const result = await sendEmail({
      email,
      displayName,
      invitationToken,
      clubName,
    });

    console.log('Email sent successfully:', result.data);

    return {
      success: true,
      message: result.data.message,
      emailId: result.data.emailId,
    };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send invitation email';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'You do not have permission to send invitations for this club';
    } else if (error.code === 'unauthenticated') {
      errorMessage = 'You must be logged in to send invitations';
    } else if (error.code === 'resource-exhausted') {
      errorMessage = 'Rate limit exceeded. Please try again later';
    } else if (error.code === 'invalid-argument') {
      errorMessage = error.message || 'Invalid invitation data';
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
