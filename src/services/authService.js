import { auth, googleProvider, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Create or update user document in Firestore
const createUserDocument = async (user, isNewUser = false) => {
  const userRef = doc(db, 'users', user.uid);
  
  // Check if user document exists
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists() || isNewUser) {
    // Create new user document with default role
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      role: 'user', // Default role
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    }, { merge: true });
  } else {
    // Update last login
    await setDoc(userRef, {
      lastLogin: serverTimestamp()
    }, { merge: true });
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await createUserDocument(userCredential.user, false);
    return { success: true, user: userCredential.user };
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
