// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDycPYqw_fHHdpiiqGlWf6NPR9fZ1j7Sek",
  authDomain: "auth-8f9e2.firebaseapp.com",
  projectId: "auth-8f9e2",
  storageBucket: "auth-8f9e2.firebasestorage.app",
  messagingSenderId: "1036381096180",
  appId: "1:1036381096180:web:7db7aa9d8f42053b18f6a1",
  measurementId: "G-HZNQZXXC00",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, auth, storage, db };
