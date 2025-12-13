import { db} from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { sendInvitationEmail } from './emailService';

// Invite a new member to the club
export const inviteMember = async (memberData, clubId, adminUid) => {
  try {
    const { email, displayName, role = 'member' } = memberData;

    // Check if user already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Get club details for email
    const clubRef = doc(db, 'clubs', clubId);
    const clubSnap = await getDoc(clubRef);
    const clubName = clubSnap.exists() ? clubSnap.data().name : 'Running Club';

    // Create secure invitation token with crypto random component
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const randomString = Array.from(randomBytes)
      .map(b => b.toString(36))
      .join('')
      .slice(0, 20);
    const invitationId = `${clubId}_${Date.now()}_${randomString}`;
    const invitationRef = doc(db, 'invitations', invitationId);
    
    const invitationData = {
      email,
      displayName,
      role,
      clubId,
      invitedBy: adminUid,
      status: 'pending',
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    await setDoc(invitationRef, invitationData);

    // Send invitation email
    const emailResult = await sendInvitationEmail(email, displayName, invitationId, clubName);

    if (!emailResult.success) {
      console.warn('Email sending failed:', emailResult.error);
      // Don't fail the invitation if email fails
    }

    return { 
      success: true, 
      invitationId,
      message: `Invitation sent to ${email}. They will receive an email with instructions to set up their account.` 
    };
  } catch (error) {
    console.error('Error inviting member:', error);
    return { success: false, error: error.message };
  }
};

// Get all members for a club
export const getClubMembers = async (clubId) => {
  try {
    if (!clubId) {
      return { success: false, error: 'Club ID is required', members: [] };
    }
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('clubId', '==', clubId));
    const querySnapshot = await getDocs(q);

    const members = [];
    querySnapshot.forEach((doc) => {
      members.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, members };
  } catch (error) {
    console.error('Error getting club members:', error);
    return { success: false, error: error.message, members: [] };
  }
};

// Get pending invitations for a club
export const getPendingInvitations = async (clubId) => {
  try {
    if (!clubId) {
      return { success: false, error: 'Club ID is required', invitations: [] };
    }
    
    const invitationsRef = collection(db, 'invitations');
    const q = query(
      invitationsRef, 
      where('clubId', '==', clubId),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);

    const invitations = [];
    querySnapshot.forEach((doc) => {
      invitations.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, invitations };
  } catch (error) {
    console.error('Error getting pending invitations:', error);
    return { success: false, error: error.message, invitations: [] };
  }
};

// Update member role
export const updateMemberRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: serverTimestamp()
    });

    return { success: true, message: 'Member role updated successfully' };
  } catch (error) {
    console.error('Error updating member role:', error);
    return { success: false, error: error.message };
  }
};

// Remove member from club
export const removeMember = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      clubId: null,
      status: 'inactive',
      updatedAt: serverTimestamp()
    });

    return { success: true, message: 'Member removed successfully' };
  } catch (error) {
    console.error('Error removing member:', error);
    return { success: false, error: error.message };
  }
};

// Cancel invitation
export const cancelInvitation = async (invitationId) => {
  try {
    const invitationRef = doc(db, 'invitations', invitationId);
    await updateDoc(invitationRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    });

    return { success: true, message: 'Invitation cancelled successfully' };
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    return { success: false, error: error.message };
  }
};

// Verify invitation and get details
export const verifyInvitation = async (invitationId) => {
  try {
    const invitationRef = doc(db, 'invitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);

    if (!invitationDoc.exists()) {
      return { success: false, error: 'Invalid invitation link' };
    }

    const invitationData = invitationDoc.data();

    // Check if invitation is expired
    const expiresAt = invitationData.expiresAt.toDate();
    if (expiresAt < new Date()) {
      return { success: false, error: 'Invitation has expired' };
    }

    // Check if invitation is still pending
    if (invitationData.status !== 'pending') {
      return { success: false, error: 'Invitation is no longer valid' };
    }

    return { 
      success: true, 
      invitation: { id: invitationDoc.id, ...invitationData } 
    };
  } catch (error) {
    console.error('Error verifying invitation:', error);
    return { success: false, error: error.message };
  }
};

// Complete member setup (called after password is set)
export const completeMemberSetup = async (invitationId, userId, userEmail, password) => {
  try {
    // Get invitation details
    const invitationRef = doc(db, 'invitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);

    if (!invitationDoc.exists()) {
      return { success: false, error: 'Invalid invitation' };
    }

    const invitationData = invitationDoc.data();

    // SECURITY: Verify email matches the invitation
    if (invitationData.email.toLowerCase() !== userEmail.toLowerCase()) {
      return { 
        success: false, 
        error: 'This invitation was sent to a different email address. Please use the correct email or request a new invitation.' 
      };
    }

    // Create user document
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      uid: userId,
      email: invitationData.email,
      displayName: invitationData.displayName,
      role: invitationData.role,
      clubId: invitationData.clubId,
      status: 'active',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });

    // Mark invitation as accepted
    await updateDoc(invitationRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp()
    });

    return { success: true, message: 'Account setup completed successfully' };
  } catch (error) {
    console.error('Error completing member setup:', error);
    return { success: false, error: error.message };
  }
};

// Get user role and permissions
export const getUserRole = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    return { 
      success: true, 
      role: userData.role || 'member',
      clubId: userData.clubId,
      isAdmin: userData.role === 'admin'
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    return { success: false, error: error.message };
  }
};
