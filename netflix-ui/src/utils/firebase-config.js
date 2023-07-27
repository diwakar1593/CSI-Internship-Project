import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyA26z8v2RKyFcyBzfeUbHeJlQBV_hH3AmA",
  authDomain: "react-netflix-clone-35532.firebaseapp.com",
  projectId: "react-netflix-clone-35532",
  storageBucket: "react-netflix-clone-35532.appspot.com",
  messagingSenderId: "1079397488390",
  appId: "1:1079397488390:web:47322720e8c1b3c91e3087",
  measurementId: "G-QRFWXFJSRX"
};


const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);

