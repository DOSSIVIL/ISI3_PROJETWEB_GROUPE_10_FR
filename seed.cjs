// seed.cjs

const admin = require("firebase-admin");

// Charge la clé de service (adapte le nom exact de ton fichier JSON !)
const serviceAccount = require("./projetscolaire-8a437-firebase-adminsdk-fbsvc-d335f17c05.json"); // ← change xxxxx par ton vrai code

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialise Firestore
const db = admin.firestore();

// ---------------------- DONNÉES À INSÉRER ----------------------

const matieresData = [
  { intitule: "Mathématiques discrètes", categorie: "Mathématiques" },
  { intitule: "Algèbre linéaire", categorie: "Mathématiques" },
  { intitule: "Physique mécanique", categorie: "Physique-Chimie" },
  { intitule: "Chimie organique", categorie: "Physique-Chimie" },
  { intitule: "Biologie cellulaire", categorie: "SVT" },
  { intitule: "Génétique", categorie: "SVT" },
  { intitule: "Littérature africaine", categorie: "Français" },
  { intitule: "Histoire du Cameroun contemporain", categorie: "Histoire-Géo" },
  { intitule: "Anglais – Communication professionnelle", categorie: "Langues" },
  { intitule: "Programmation Python avancée", categorie: "Informatique" },
];

const utilisateursData = [
  // Étudiants (5)
  {
    uid: "etu_001",
    nom: "Nana",
    prenom: "Awa",
    email: "awa.nana@edu.cm",
    role: "etudiant",
    filiere: "Informatique",
    niveau: "L3",
    typeUtilisateur: "etudiant",
  },
  {
    uid: "etu_002",
    nom: "Kamga",
    prenom: "Jean",
    email: "jean.kamga@edu.cm",
    role: "etudiant",
    filiere: "Mathématiques",
    niveau: "L2",
    typeUtilisateur: "etudiant",
  },
  {
    uid: "etu_003",
    nom: "Tchatchou",
    prenom: "Marie",
    email: "marie.tchatchou@edu.cm",
    role: "etudiant",
    filiere: "SVT",
    niveau: "Master 1",
    typeUtilisateur: "etudiant",
  },
  {
    uid: "etu_004",
    nom: "Biya",
    prenom: "Paul",
    email: "paul.biya@etu.cm",
    role: "etudiant",
    filiere: "Physique",
    niveau: "L3",
    typeUtilisateur: "etudiant",
  },
  {
    uid: "etu_005",
    nom: "Fouda",
    prenom: "Sophie",
    email: "sophie.fouda@edu.cm",
    role: "etudiant",
    filiere: "Anglais",
    niveau: "L1",
    typeUtilisateur: "etudiant",
  },

  // Tuteurs (5)
  {
    uid: "tut_001",
    nom: "Mekoulou",
    prenom: "Joseph",
    email: "joseph.mekoulou@tutor.edu.cm",
    role: "tuteur",
    specialite: "Mathématiques",
    grade: "Master 2",
    status: true,
    typeUtilisateur: "tuteur",
  },
  {
    uid: "tut_002",
    nom: "Essomba",
    prenom: "Elise",
    email: "elise.essomba@tutor.edu.cm",
    role: "tuteur",
    specialite: "Physique-Chimie",
    grade: "Doctorat",
    status: true,
    typeUtilisateur: "tuteur",
  },
  {
    uid: "tut_003",
    nom: "Ndongo",
    prenom: "Samuel",
    email: "samuel.ndongo@tutor.edu.cm",
    role: "tuteur",
    specialite: "SVT",
    grade: "Licence",
    status: true,
    typeUtilisateur: "tuteur",
  },
  {
    uid: "tut_004",
    nom: "Owona",
    prenom: "Clarisse",
    email: "clarisse.owona@tutor.edu.cm",
    role: "tuteur",
    specialite: "Français",
    grade: "Master",
    status: false,
    typeUtilisateur: "tuteur",
  },
  {
    uid: "tut_005",
    nom: "Takam",
    prenom: "Robert",
    email: "robert.takam@tutor.edu.cm",
    role: "tuteur",
    specialite: "Informatique",
    grade: "Ingénieur",
    status: true,
    typeUtilisateur: "tuteur",
  },
];

const seancesData = [
  {
    dateSeance: new Date("2026-01-10T14:00:00"),
    heureDebut: "14:00",
    heureFin: "15:30",
    typeSeance: "Individuelle",
    etudiantId: "etu_001",
    tuteurId: "tut_001",
    matiereId: "matiere_001",
  },
  // Ajoute ici les 9 autres comme dans mon précédent message (je les ai raccourcies pour l'exemple)
  {
    dateSeance: new Date("2026-01-11T09:00:00"),
    heureDebut: "09:00",
    heureFin: "10:30",
    typeSeance: "Groupe",
    etudiantId: null,
    tuteurId: "tut_002",
    matiereId: "matiere_003",
  },
  // ... etc.
];

const assistantIAData = [
  {
    date: new Date("2026-01-01T10:15:00"),
    categorie: "Méthodologie",
    langue: "fr",
    reponse: "Voici un plan de révision efficace...",
    etudiantId: "etu_001",
  },
  // ... ajoute les 9 autres
];

// ---------------------- FONCTION D'INSERTION ----------------------

async function seedDatabase() {
  console.log("Début du seeding...");

  try {
    // 1. Matières
    for (const matiere of matieresData) {
      const docRef = await db.collection("matieres").add(matiere);
      console.log(`Matière ajoutée : ${matiere.intitule} (ID: ${docRef.id})`);
    }

    // 2. Utilisateurs (set avec UID comme ID)
    for (const user of utilisateursData) {
      await db.collection("users").doc(user.uid).set(user);
      console.log(`Utilisateur ajouté : ${user.email} (${user.role})`);
    }

    // 3. Séances
    for (const seance of seancesData) {
      const docRef = await db.collection("seances").add(seance);
      console.log(
        `Séance ajoutée : ${seance.dateSeance.toLocaleDateString()} (ID: ${
          docRef.id
        })`
      );
    }

    // 4. Interactions IA
    for (const ia of assistantIAData) {
      const docRef = await db.collection("assistantIA").add(ia);
      console.log(
        `Interaction IA ajoutée : ${ia.date.toLocaleDateString()} (ID: ${
          docRef.id
        })`
      );
    }

    console.log("Seeding terminé avec succès !");
  } catch (err) {
    console.error("Erreur lors du seeding :", err);
  }
}

seedDatabase();
