// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // For Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBw4hcni5AnMmFZflq8Y_inDwqpqqlkhGg",
  authDomain: "personalize-calendar.firebaseapp.com",
  projectId: "personalize-calendar",
  storageBucket: "personalize-calendar.firebasestorage.app",
  messagingSenderId: "895510966205",
  appId: "1:895510966205:web:dbc2c26571fd09e500ecd4",
  measurementId: "G-W2B8L38YQT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
