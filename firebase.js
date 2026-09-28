// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzvuz5mu6ONdbA6yxDUWOi8Kf2w8_EAsc",
  authDomain: "school-learning-platform-3724e.firebaseapp.com",
  projectId: "school-learning-platform-3724e",
  storageBucket: "school-learning-platform-3724e.firebasestorage.app",
  messagingSenderId: "834872395484",
  appId: "1:834872395484:web:f58854a974f0f2afc8d619",
  measurementId: "G-VDS4EX09ER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);