import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

console.log('🔥 Initializing Firebase for Production...');
console.log('📍 Project ID:', firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with EXPLICIT production settings
// Using initializeFirestore instead of getFirestore to have full control
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: false,
  experimentalAutoDetectLongPolling: false,
  ignoreUndefinedProperties: true,
  // NO emulator settings - force production
});

console.log('✅ Firestore initialized for PRODUCTION');

// Initialize other Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to Functions Emulator if in development
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FUNCTIONS_EMULATOR === 'true') {
  console.log('🔧 Connecting to Functions Emulator at localhost:5001');
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export const googleProvider = new GoogleAuthProvider();

export default app;
