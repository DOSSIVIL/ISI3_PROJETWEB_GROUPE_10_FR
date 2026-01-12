// src/Service/matiereService.js

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase/firebase-config.js";
/**
 * Service pour gérer les opérations CRUD sur les matières (Firestore)
 */
const matiereService = {
  /**
   * Récupère toutes les matières
   * @returns {Promise<Array>} Liste des matières avec leur id
   */
  async getAll() {
    try {
      const matieresCol = collection(db, "matieres");
      const matiereSnapshot = await getDocs(matieresCol);

      const matiereList = matiereSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return matiereList;
    } catch (error) {
      console.error("Erreur getAll matieres:", error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle matière
   * @param {Object} matiereData - Données de la matière (nom, coefficient, etc.)
   * @returns {Promise<string>} ID du document créé
   */
  async create(matiereData) {
    try {
      const matieresCol = collection(db, "matieres");
      const docRef = await addDoc(matieresCol, matiereData);
      return docRef.id;
    } catch (error) {
      console.error("Erreur création matière:", error);
      throw error;
    }
  },

  /**
   * Met à jour une matière existante
   * @param {string} id - ID Firestore de la matière
   * @param {Object} matiereData - Nouvelles données
   * @returns {Promise<void>}
   */
  async update(id, matiereData) {
    try {
      const matiereRef = doc(db, "matieres", id);
      await updateDoc(matiereRef, matiereData);
    } catch (error) {
      console.error("Erreur mise à jour matière:", error);
      throw error;
    }
  },

  /**
   * Supprime une matière
   * @param {string} id - ID Firestore de la matière
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const matiereRef = doc(db, "matieres", id);
      await deleteDoc(matiereRef);
    } catch (error) {
      console.error("Erreur suppression matière:", error);
      throw error;
    }
  },

  /**
   * Récupère une seule matière par son ID (optionnel)
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    try {
      const matiereRef = doc(db, "matieres", id);
      const matiereSnap = await getDoc(matiereRef);

      if (matiereSnap.exists()) {
        return {
          id: matiereSnap.id,
          ...matiereSnap.data(),
        };
      }
      return null;
    } catch (error) {
      console.error("Erreur getById:", error);
      throw error;
    }
  },
};

export default matiereService;
