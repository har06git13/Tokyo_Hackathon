// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDG_QGCS8r1JuKcc96fqg2nLknYPI_i8nE",
  authDomain: "shibuya-waitan.firebaseapp.com",
  projectId: "shibuya-waitan",
  storageBucket: "shibuya-waitan.firebasestorage.app",
  messagingSenderId: "763878847638",
  appId: "1:763878847638:web:ac8c52ee6836e64dfcbeb7",
  measurementId: "G-JQ8S6HT0S5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
