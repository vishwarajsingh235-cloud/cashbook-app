import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAhoZdjYiY5sJ6BYpCMqzhYi39gJ73Z8eg",
  authDomain: "cashledger-6468a.firebaseapp.com",
  projectId: "cashledger-6468a",
  storageBucket: "cashledger-6468a.firebasestorage.app",
  messagingSenderId: "578880366571",
  appId: "1:578880366571:web:47e49a8a482f7708439bae",
  measurementId: "G-SGL55M7RTT"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);