// firebase/firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAHnlS177olRKu3WJBO-yTQsd4vNI0MIFs",
  authDomain: "achitectureweb-groupe-10.firebaseapp.com",
  projectId: "achitectureweb-groupe-10",
  storageBucket: "achitectureweb-groupe-10.firebasestorage.app",
  messagingSenderId: "646899550480",
  appId: "1:646899550480:web:687fd4f4b2e0ca646efd95",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  addDoc,
  app,
  auth,
  collection,
  createUserWithEmailAndPassword,
  db,
  serverTimestamp,
  Timestamp,
  updateProfile,
};
