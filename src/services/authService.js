import { auth, googleProvider, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Create or update user document in Firestore
const createUserDocument = async (user, isNewUser = false, additionalData = {}) => {
  const userRef = doc(db, 'users', user.uid);
  
  // Check if user document exists
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists() || isNewUser) {
    // Create new user document with default role
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.displayName || user.email.split('@')[0],
      role: additionalData.role || 'member', // Default role
      clubId: additionalData.clubId || null,
      isActive: true,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      ...additionalData
    }, { merge: true });
  } else {
    // Update last login
    await setDoc(userRef, {
      lastLogin: serverTimestamp()
    }, { merge: true });
  }
  
  // Return user data with role
  const updatedUserDoc = await getDoc(userRef);
  return updatedUserDoc.data();
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userData = await createUserDocument(userCredential.user, false);
    return { success: true, user: userCredential.user, userData };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error: error.message };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserDocument(userCredential.user, true);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error signing up:', error);
    return { success: false, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserDocument(result.user, false);
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { success: false, error: error.message };
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe to auth state changes
export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    let errorMessage = 'Failed to send password reset email';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    return { success: false, error: errorMessage };
  }
};
