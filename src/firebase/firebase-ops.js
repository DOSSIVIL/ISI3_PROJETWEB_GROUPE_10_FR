// firebase/firebase-ops.js
import { 
    db, 
    auth, 
    collection, 
    addDoc, 
    serverTimestamp,
    createUserWithEmailAndPassword,
    updateProfile 
  } from './firebase-config.js';
  
  class FirebaseOperations {
    
    /**
     * Créer un utilisateur avec email et mot de passe
     */
    static async createUser(email, password, userData) {
      try {
        // 1. Créer l'utilisateur dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // 2. Mettre à jour le profil avec nom et prénom
        await updateProfile(user, {
          displayName: `${userData.prenom} ${userData.nom}`
        });
        
        // 3. Préparer les données pour Firestore
        const enseignantData = {
          uid: user.uid,
          email: email,
          nom: userData.nom,
          prenom: userData.prenom,
          nomComplet: `${userData.prenom} ${userData.nom}`,
          sexe: userData.sexe,
          diplome: userData.diplome,
          matieres: userData.matieres,
          matieresText: userData.matieresText || [],
          langue: userData.langue,
          role: 'enseignant',
          statut: 'actif',
          dateInscription: serverTimestamp(),
          dateCreation: new Date().toISOString(),
          photoURL: '', // Laissez vide pour l'instant
          telephone: '', // À ajouter plus tard
          bio: '', // À ajouter plus tard
          experience: 0, // Années d'expérience
          noteMoyenne: 0, // Note moyenne initiale
          nombreCours: 0, // Nombre de cours donnés
          verifie: false, // À vérifier par l'admin
          preferences: {
            notifications: true,
            emails: true,
            visibilite: 'public'
          }
        };
        
        // 4. Ajouter à la collection "enseignants"
        const docRef = await addDoc(collection(db, "enseignants"), enseignantData);
        
        // 5. Créer aussi un document dans "users" pour les données générales
        const userGeneralData = {
          uid: user.uid,
          email: email,
          nom: userData.nom,
          prenom: userData.prenom,
          role: 'enseignant',
          dateCreation: serverTimestamp(),
          derniereConnexion: serverTimestamp()
        };
        
        await addDoc(collection(db, "users"), userGeneralData);
        
        return {
          success: true,
          user: user,
          enseignantId: docRef.id,
          message: "Inscription réussie !"
        };
        
      } catch (error) {
        console.error("Erreur Firebase:", error);
        
        // Gestion des erreurs détaillée
        let errorMessage = "Une erreur est survenue lors de l'inscription.";
        
        switch(error.code) {
          case 'auth/email-already-in-use':
            errorMessage = "Cet email est déjà utilisé. Essayez de vous connecter.";
            break;
          case 'auth/invalid-email':
            errorMessage = "L'adresse email n'est pas valide.";
            break;
          case 'auth/weak-password':
            errorMessage = "Le mot de passe est trop faible. Utilisez au moins 6 caractères.";
            break;
          case 'auth/operation-not-allowed':
            errorMessage = "L'inscription par email/mot de passe n'est pas activée.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Problème de connexion internet. Veuillez réessayer.";
            break;
          case 'permission-denied':
            errorMessage = "Permission refusée. Vérifiez les règles de sécurité Firebase.";
            break;
        }
        
        return {
          success: false,
          error: errorMessage,
          code: error.code
        };
      }
    }
    
    /**
     * Vérifier si un email existe déjà
     */
    static async checkEmailExists(email) {
      // Note: Firebase n'a pas de méthode directe pour vérifier un email
      // Vous devriez gérer cela côté client ou utiliser une Cloud Function
      return false;
    }
    
    /**
     * Envoyer un email de vérification
     */
    static async sendVerificationEmail(user) {
      // À implémenter si besoin
      console.log("Email de vérification à envoyer pour:", user.email);
    }
  }
  
  // Exporter
  export default FirebaseOperations;