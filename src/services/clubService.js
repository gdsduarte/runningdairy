import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc,
  getDoc, 
  serverTimestamp,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

/**
 * Generate a unique club ID
 */
const generateClubId = () => {
  return `club_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if club name already exists
 */
export const checkClubNameAvailable = async (clubName) => {
  try {
    const q = query(
      collection(db, 'clubs'),
      where('name', '==', clubName)
    );
    const snapshot = await getDocs(q);
    
    return {
      success: true,
      available: snapshot.empty
    };
  } catch (error) {
    console.error('Error checking club name:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create a new club with admin account
 * @param {Object} clubData - Club information
 * @param {Object} adminData - Admin account information
 * @param {string} planType - Payment plan: '7day-trial', 'monthly', 'yearly'
 */
export const registerClub = async (clubData, adminData, planType) => {
  try {
    // Generate unique club ID
    const clubId = generateClubId();
    
    // Create club document
    const clubRef = doc(db, 'clubs', clubId);
    await setDoc(clubRef, {
      name: clubData.name,
      description: clubData.description || '',
      createdAt: serverTimestamp(),
      isActive: true,
      planType: planType,
      planStartDate: serverTimestamp(),
      // For trial, set expiry to 7 days from now
      planExpiryDate: planType === '7day-trial' 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : null
    });

    // Create admin Firebase Auth account
    let adminUid;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminData.email,
        adminData.password
      );
      adminUid = userCredential.user.uid;
    } catch (authError) {
      console.error('Error creating admin auth account:', authError);
      throw new Error(`Failed to create admin account: ${authError.message}`);
    }

    // Create admin user document
    const userRef = doc(db, 'users', adminUid);
    await setDoc(userRef, {
      email: adminData.email,
      displayName: adminData.name,
      role: 'admin',
      clubId: clubId,
      createdAt: serverTimestamp(),
      isActive: true
    });

    return {
      success: true,
      clubId: clubId,
      adminUid: adminUid,
      message: 'Club registered successfully'
    };
  } catch (error) {
    console.error('Error registering club:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get club details by ID
 */
export const getClubDetails = async (clubId) => {
  try {
    const clubRef = doc(db, 'clubs', clubId);
    const clubSnap = await getDoc(clubRef);
    
    if (!clubSnap.exists()) {
      return {
        success: false,
        error: 'Club not found'
      };
    }

    return {
      success: true,
      club: {
        id: clubSnap.id,
        ...clubSnap.data()
      }
    };
  } catch (error) {
    console.error('Error getting club details:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Search for clubs by name or location
 * @param {string} searchQuery - Search term
 */
export const searchClubs = async (searchQuery = "") => {
  try {
    const clubsRef = collection(db, 'clubs');
    const q = query(clubsRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    
    let clubs = [];
    snapshot.forEach((doc) => {
      clubs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Filter by search query if provided
    if (searchQuery && searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      clubs = clubs.filter(
        (club) =>
          club.name?.toLowerCase().includes(lowerQuery) ||
          club.location?.toLowerCase().includes(lowerQuery) ||
          club.description?.toLowerCase().includes(lowerQuery)
      );
    }

    // Get member count for each club
    for (let club of clubs) {
      const membersRef = collection(db, 'users');
      const membersQuery = query(
        membersRef,
        where('clubId', '==', club.id),
        where('isActive', '==', true)
      );
      const membersSnapshot = await getDocs(membersQuery);
      club.memberCount = membersSnapshot.size;
    }

    return clubs;
  } catch (error) {
    console.error('Error searching clubs:', error);
    throw error;
  }
};

/**
 * Request to join a club
 * @param {string} userId - User ID
 * @param {string} clubId - Club ID
 */
export const requestToJoinClub = async (userId, clubId) => {
  try {
    // Check if user already has a club
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().clubId) {
      throw new Error('You are already a member of a club');
    }

    // Check if request already exists
    const requestsRef = collection(db, 'joinRequests');
    const existingQuery = query(
      requestsRef,
      where('userId', '==', userId),
      where('clubId', '==', clubId),
      where('status', '==', 'pending')
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      throw new Error('You already have a pending request for this club');
    }

    // Get user and club details
    const clubRef = doc(db, 'clubs', clubId);
    const clubSnap = await getDoc(clubRef);
    
    if (!clubSnap.exists()) {
      throw new Error('Club not found');
    }

    // Create join request
    await addDoc(requestsRef, {
      userId,
      clubId,
      userName: userSnap.data().displayName || userSnap.data().email,
      userEmail: userSnap.data().email,
      clubName: clubSnap.data().name,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error requesting to join club:', error);
    throw error;
  }
};

/**
 * Get user's pending join requests
 * @param {string} userId - User ID
 */
export const getJoinRequests = async (userId) => {
  try {
    const requestsRef = collection(db, 'joinRequests');
    const q = query(
      requestsRef,
      where('userId', '==', userId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    
    const requests = [];
    snapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return requests;
  } catch (error) {
    console.error('Error getting join requests:', error);
    throw error;
  }
};

/**
 * Get pending join requests for a club (admin only)
 * @param {string} clubId - Club ID
 */
export const getClubJoinRequests = async (clubId) => {
  try {
    const requestsRef = collection(db, 'joinRequests');
    const q = query(
      requestsRef,
      where('clubId', '==', clubId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    const requests = [];
    snapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return requests;
  } catch (error) {
    console.error('Error getting club join requests:', error);
    throw error;
  }
};

/**
 * Approve a join request
 * @param {string} requestId - Join request ID
 * @param {string} userId - User ID
 * @param {string} clubId - Club ID
 */
export const approveJoinRequest = async (requestId, userId, clubId) => {
  try {
    // Get user document to check existing data
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    
    // Update user document to add clubId, preserving existing role if set
    await updateDoc(userRef, {
      clubId: clubId,
      role: userData.role || 'member',
      isActive: true,
      updatedAt: serverTimestamp()
    });

    // Update join request status
    const requestRef = doc(db, 'joinRequests', requestId);
    await updateDoc(requestRef, {
      status: 'approved',
      processedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error approving join request:', error);
    throw error;
  }
};

/**
 * Reject a join request
 * @param {string} requestId - Join request ID
 */
export const rejectJoinRequest = async (requestId) => {
  try {
    const requestRef = doc(db, 'joinRequests', requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      processedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting join request:', error);
    throw error;
  }
};
