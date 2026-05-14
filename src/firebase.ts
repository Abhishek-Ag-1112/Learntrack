import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC_LZz8clZXrTdSafhQzL8FlO9BgDP3CLU",
  authDomain: "learntrack-ee232.firebaseapp.com",
  projectId: "learntrack-ee232",
  storageBucket: "learntrack-ee232.firebasestorage.app",
  messagingSenderId: "569644032651",
  appId: "1:569644032651:web:6b166f0908aa3a40bdaa8e",
  measurementId: "G-GN2TR6499E"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
