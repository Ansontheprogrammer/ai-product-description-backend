// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9NIyR-3XgrIFj95EGatP1J9mpfWlY58k",
  authDomain: "allyproductdescriptions.firebaseapp.com",
  projectId: "allyproductdescriptions",
  storageBucket: "allyproductdescriptions.firebasestorage.app",
  messagingSenderId: "8644125935",
  appId: "1:8644125935:web:ee2535069e304f0715671a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Get Firestore instance
export const db = getFirestore(app);
