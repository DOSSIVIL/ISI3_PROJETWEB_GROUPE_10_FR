// services/auth.service.js
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

import { app } from "../firebase/firebase-config.js";
import { Etudiant } from "../models/Etudiant.model.js";
import { Tuteur } from "../models/Tuteur.model.js";

const auth = getAuth(app);
const db = getFirestore(app);

class AuthService {
  // ── Inscription ───────────────────────────────────────────────
  async registerEtudiant(email, password, data) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      const etudiant = new Etudiant({
        ...data,
        email,
        id: uid,
        dateCreation: new Date(),
        typeUtilisateur: "etudiant",
      });

      // Sauvegarde dans la collection etudiants
      await setDoc(doc(db, "etudiants", uid), etudiant.toFirestore());

      // Optionnel : aussi dans une collection users générique
      await setDoc(
        doc(db, "users", uid),
        {
          ...etudiant.toFirestore(),
          role: "etudiant",
        },
        { merge: true }
      );

      return etudiant;
    } catch (error) {
      throw this._formatFirebaseError(error);
    }
  }

  async registerTuteur(email, password, data) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      const tuteur = new Tuteur({
        ...data,
        email,
        id: uid,
        dateCreation: new Date(),
        typeUtilisateur: "tuteur",
      });

      await setDoc(doc(db, "tuteurs", uid), tuteur.toFirestore());

      await setDoc(
        doc(db, "users", uid),
        {
          ...tuteur.toFirestore(),
          role: "tuteur",
        },
        { merge: true }
      );

      return tuteur;
    } catch (error) {
      throw this._formatFirebaseError(error);
    }
  }

  // ── Connexion ─────────────────────────────────────────────────
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      // Recherche du profil utilisateur
      const userProfile = await this.getUserProfile(uid);

      if (!userProfile) {
        throw new Error(
          "Profil utilisateur non trouvé dans la base de données"
        );
      }

      return userProfile;
    } catch (error) {
      throw this._formatFirebaseError(error);
    }
  }

  async getUserProfile(uid) {
    // Essayer de trouver dans "users" d'abord (plus rapide)
    const userSnap = await getDoc(doc(db, "users", uid));

    if (userSnap.exists()) {
      const data = userSnap.data();
      const role = data.role || data.typeUtilisateur;

      if (role === "etudiant") {
        return new Etudiant({ id: uid, ...data });
      }
      if (role === "tuteur") {
        return new Tuteur({ id: uid, ...data });
      }
    }

    // Sinon recherche dans les collections spécifiques
    const [etudiantSnap, tuteurSnap] = await Promise.all([
      getDoc(doc(db, "etudiants", uid)),
      getDoc(doc(db, "tuteurs", uid)),
    ]);

    if (etudiantSnap.exists()) {
      return new Etudiant({ id: uid, ...etudiantSnap.data() });
    }

    if (tuteurSnap.exists()) {
      return new Tuteur({ id: uid, ...tuteurSnap.data() });
    }

    return null;
  }

  // ── Utilitaires ───────────────────────────────────────────────
  logout() {
    return signOut(auth);
  }

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await this.getUserProfile(firebaseUser.uid);
        callback(profile);
      } else {
        callback(null);
      }
    });
  }

  _formatFirebaseError(error) {
    let message = "Une erreur est survenue";

    switch (error.code) {
      case "auth/email-already-in-use":
        message = "Cet email est déjà utilisé";
        break;
      case "auth/invalid-email":
        message = "Format d'email invalide";
        break;
      case "auth/weak-password":
        message = "Le mot de passe est trop faible";
        break;
      case "auth/user-not-found":
        message = "Aucun compte trouvé avec cet email";
        break;
      case "auth/wrong-password":
        message = "Mot de passe incorrect";
        break;
      case "auth/too-many-requests":
        message = "Trop de tentatives. Réessayez plus tard";
        break;
      default:
        message = error.message;
    }

    const formatted = new Error(message);
    formatted.code = error.code;
    return formatted;
  }
}

export const authService = new AuthService();
export default authService;
