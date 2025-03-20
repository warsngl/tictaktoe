// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyARaU1PFr1XoHT1g6y1-Dctv3y_G8hdkW4",
    authDomain: "tic-tac-toe-advanced-4d339.firebaseapp.com",
    databaseURL: "https://tic-tac-toe-advanced-4d339-default-rtdb.firebaseio.com",
    projectId: "tic-tac-toe-advanced-4d339",
    storageBucket: "tic-tac-toe-advanced-4d339.firebasestorage.app",
    messagingSenderId: "846237946652",
    appId: "1:846237946652:web:b960e2f6e48c74bea560d9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase()