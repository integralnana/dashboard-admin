// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBO3VQD8fjFxezDPJYY8FSmZxrm_WMSmBU",
  authDomain: "myproj-c6008.firebaseapp.com",
  projectId: "myproj-c6008",
  storageBucket: "myproj-c6008.appspot.com",
  messagingSenderId: "163897380043",
  appId: "1:163897380043:web:85edaab7bc1a50fca79f4e",
  measurementId: "G-H8TE85ZDTL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
