// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // SSR'de hata veriyor, kaldırıldı
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChE-gJsPcCpcMyhlvuPnKayPYje_xHAZc",
  authDomain: "fit-takip.firebaseapp.com",
  projectId: "fit-takip",
  storageBucket: "fit-takip.firebasestorage.app",
  messagingSenderId: "756433300030",
  appId: "1:756433300030:web:fcaead52a714cb664e3f6f",
  measurementId: "G-W70P0NHM92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // SSR'de hata veriyor, kaldırıldı
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, provider, signInWithPopup, signOut, db };
