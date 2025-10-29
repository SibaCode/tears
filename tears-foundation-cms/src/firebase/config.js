// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your TEARS Foundation Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWYu0W_yfd_667TU2JqyspUTW78Os5ujY",
  authDomain: "tearsfoundation-df360.firebaseapp.com",
  projectId: "tearsfoundation-df360",
  storageBucket: "tearsfoundation-df360.firebasestorage.app",
  messagingSenderId: "549496823935",
  appId: "1:549496823935:web:83ba2a469f0e6b482d9f4a",
  measurementId: "G-9EQ0CVSHLB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
export default app;