import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACdbmMcGHQ2kwz39tCWHYp4m1oJJScnfQ",
  authDomain: "food-bridge-26ae3.firebaseapp.com",
  projectId: "food-bridge-26ae3",
  storageBucket: "food-bridge-26ae3.firebasestorage.app",
  messagingSenderId: "518830553947",
  appId: "1:518830553947:web:fd927ff9c1bcb51201387e",
  measurementId: "G-SRZ4WHJQR4"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

let analytics;
if (typeof window !== "undefined") {
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, analytics };
