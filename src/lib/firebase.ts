import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * REPLACEME: When you get your config from Firebase Console, paste it here.
 * It will look something like this:
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCdGvxVOQ_nX0lFmzIUl8eI4bLcHmZXYKE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "runagone-67048.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "runagone-67048",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "runagone-67048.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "883230259865",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:883230259865:web:546c41a912768f863f5608",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EWH2K6WE5K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
