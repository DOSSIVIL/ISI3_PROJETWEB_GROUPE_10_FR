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

/* The commented out `firebaseConfig` object is a configuration object that contains the necessary
credentials and settings for connecting to a Firebase project. It includes properties like `apiKey`,
`authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, and `appId`. */
const firebaseConfig = {
  apiKey: "AIzaSyAHnlS177olRKu3WJBO-yTQsd4vNI0MIFs",
  authDomain: "achitectureweb-groupe-10.firebaseapp.com",
  projectId: "achitectureweb-groupe-10",
  storageBucket: "achitectureweb-groupe-10.firebasestorage.app",
  messagingSenderId: "646899550480",
  appId: "1:646899550480:web:687fd4f4b2e0ca646efd95",
};

// const firebaseConfig = {
//   apiKey: "AIzaSyBtoYd9WwiKq7p9nikG9dS50AwDCHDKPp4",
//   authDomain: "projetscolaire-8a437.firebaseapp.com",
//   projectId: "projetscolaire-8a437",
//   storageBucket: "projetscolaire-8a437.firebasestorage.app",
//   messagingSenderId: "489152998874",
//   appId: "1:489152998874:web:9a527c9a9faf47be7e24e3",
// };

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
