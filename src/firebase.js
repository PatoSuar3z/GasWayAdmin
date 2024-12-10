import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyB-TfqXqCWoaDmt4xezotSR8vBS9Fu2btg",
  authDomain: "gw-fb-8dccc.firebaseapp.com",
  projectId: "gw-fb-8dccc",
  storageBucket: "gw-fb-8dccc.firebasestorage.app",
  messagingSenderId: "149306202525",
  appId: "1:149306202525:web:49818adbc16e224848b774",
  measurementId: "G-1HXZ8Q6MWX",
}


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
export const storage = getStorage(app);
