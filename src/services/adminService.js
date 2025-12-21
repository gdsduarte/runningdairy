import { db} from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

// Get all members for a club
export const getClubMembers = async (clubId) => {
  try {
    if (!clubId) {
      return { success: false, error: 'Club ID is required', members: [] };
    }
    
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('clubId', '==', clubId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    
    const members = [];
    snapshot.forEach((doc) => {
      members.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, members };
  } catch (error) {
    console.error('Error getting club members:', error);
    return { success: false, error: error.message, members: [] };
  }
};

// Update member role
export const updateMemberRole = async (userId, newRole, currentUserRole, targetUserRole) => {
  try {
    // Permission check: moderators can only update members
    if (currentUserRole === 'moderator' && targetUserRole !== 'member') {
      return { 
        success: false, 
        error: 'Moderators can only update members, not admins or other moderators' 
      };
    }

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
export const removeMember = async (userId, currentUserRole, targetUserRole) => {
  try {
    // Permission check: moderators can only remove members
    if (currentUserRole === 'moderator' && targetUserRole !== 'member') {
      return { 
        success: false, 
        error: 'Moderators can only remove members, not admins or other moderators' 
      };
    }

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
