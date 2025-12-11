import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc,
  getDoc, 
  serverTimestamp,
  getDocs,
  query,
  where
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
      name: adminData.name,
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
