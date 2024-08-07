// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-0aIqvjOvLmCo1uWXnHLxT7TqO20qTwE",
  authDomain: "inventory-management-74d1f.firebaseapp.com",
  projectId: "inventory-management-74d1f",
  storageBucket: "inventory-management-74d1f.appspot.com",
  messagingSenderId: "111941774125",
  appId: "1:111941774125:web:face0239197a84c8f781a4",
  measurementId: "G-Y8813X4D8X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}