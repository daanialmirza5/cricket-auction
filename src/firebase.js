import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBo3ITwFgt79N5If6kaiIyqCGSIrNQyA-Y",
  authDomain: "cricket-auction-76a1f.firebaseapp.com",
  projectId: "cricket-auction-76a1f",
  storageBucket: "cricket-auction-76a1f.firebasestorage.app",
  databaseURL: "https://cricket-auction-76a1f-default-rtdb.asia-southeast1.firebasedatabase.app/",
  messagingSenderId: "700473905801",
  appId: "1:700473905801:web:f27bd040fb7dfa81eb2c58",
  measurementId: "G-JPPK8W18L6"
};


const app = initializeApp(firebaseConfig);

export default app;