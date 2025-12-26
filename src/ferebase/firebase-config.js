// firebase/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  Timestamp,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAHnlS177olRKu3WJBO-yTQsd4vNI0MIFs",
  authDomain: "achitectureweb-groupe-10.firebaseapp.com",
  projectId: "achitectureweb-groupe-10",
  storageBucket: "achitectureweb-groupe-10.firebasestorage.app",
  messagingSenderId: "646899550480",
  appId: "1:646899550480:web:687fd4f4b2e0ca646efd95"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
const db = getFirestore(app);
const auth = getAuth(app);

// Exporter
export { 
  app, 
  db, 
  auth, 
  collection, 
  addDoc, 
  Timestamp, 
  serverTimestamp,
  createUserWithEmailAndPassword,
  updateProfile 
};