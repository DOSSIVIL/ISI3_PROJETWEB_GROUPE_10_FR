// ==================== CONFIGURATION FIREBASE ====================
const firebaseConfig = {
  apiKey: "AIzaSyBtoYd9WwiKq7p9nikG9dS50AwDCHDKPp4",
  authDomain: "projetscolaire-8a437.firebaseapp.com",
  projectId: "projetscolaire-8a437",
  storageBucket: "projetscolaire-8a437.firebasestorage.app",
  messagingSenderId: "489152998874",
  appId: "1:489152998874:web:9a527c9a9faf47be7e24e3",
};

// Initialiser Firebase
let app, db, auth;
try {
  app = firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
  console.log("Firebase initialisé avec succès");
} catch (error) {
  console.error("Erreur d'initialisation Firebase:", error);
}

// ==================== FONCTIONS UTILITAIRES ====================
function showNotification(message, type = "info") {
  // Supprimer les notifications existantes
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

  const notification = document.createElement("div");
  notification.className = `notification animate__animated animate__fadeInRight ${
    type === "success"
      ? "notification-success"
      : type === "error"
      ? "notification-error"
      : "notification-info"
  }`;

  const icon =
    type === "success"
      ? "fa-check-circle"
      : type === "error"
      ? "fa-exclamation-circle"
      : "fa-info-circle";

  notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${icon} text-xl"></i>
            <div class="flex-1">
                <p class="font-bold">${
                  type === "success"
                    ? "Succès !"
                    : type === "error"
                    ? "Erreur !"
                    : "Information"
                }</p>
                <p class="text-sm opacity-90">${message}</p>
            </div>
            <button class="text-white opacity-70 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

  document.body.appendChild(notification);

  // Supprimer automatiquement après 5 secondes
  setTimeout(() => {
    if (notification.parentElement) {
      notification.classList.add("animate__fadeOutRight");
      setTimeout(() => notification.remove(), 500);
    }
  }, 5000);
}

function resetFormErrors() {
  // Réinitialiser les messages d'erreur
  document.querySelectorAll(".error-message").forEach((el) => {
    el.classList.add("hidden");
    el.textContent = "";
  });

  // Réinitialiser les styles des champs
  document.querySelectorAll("input, select").forEach((field) => {
    field.classList.remove("border-red-500", "error-shake");
  });
}

// ==================== GESTION DU FORMULAIRE ====================
document.addEventListener("DOMContentLoaded", function () {
  // EMPÊCHER LA SOUMISSION PAR DÉFAUT DU FORMULAIRE
  const form = document.getElementById("registrationForm");
  if (form) {
    // Empêcher le comportement par défaut (qui envoie dans l'URL)
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // CECI EST ESSENTIEL !
      handleFormSubmit(e);
    });

    // S'assurer que le formulaire n'a pas de méthode GET
    form.method = "post"; // ou enlever l'attribut method
  }
});

// ==================== GESTION DES MOTS DE PASSE ====================
function checkPasswordStrength() {
  const passwordInput = document.getElementById("password");
  const password = passwordInput.value;
  let score = 0;

  // Vérifier chaque critère
  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  // Calcul du score (chaque critère vaut 20 points)
  if (hasLength) score += 20;
  if (hasUppercase) score += 20;
  if (hasLowercase) score += 20;
  if (hasNumber) score += 20;
  if (hasSpecial) score += 20;

  // Mettre à jour les icônes des exigences
  const reqLength = document.getElementById("reqLength");
  const reqUppercase = document.getElementById("reqUppercase");
  const reqLowercase = document.getElementById("reqLowercase");
  const reqNumber = document.getElementById("reqNumber");
  const reqSpecial = document.getElementById("reqSpecial");

  if (reqLength)
    reqLength.className = hasLength
      ? "fas fa-check-circle requirement-icon requirement-met"
      : "fas fa-times-circle requirement-icon requirement-not-met";
  if (reqUppercase)
    reqUppercase.className = hasUppercase
      ? "fas fa-check-circle requirement-icon requirement-met"
      : "fas fa-times-circle requirement-icon requirement-not-met";
  if (reqLowercase)
    reqLowercase.className = hasLowercase
      ? "fas fa-check-circle requirement-icon requirement-met"
      : "fas fa-times-circle requirement-icon requirement-not-met";
  if (reqNumber)
    reqNumber.className = hasNumber
      ? "fas fa-check-circle requirement-icon requirement-met"
      : "fas fa-times-circle requirement-icon requirement-not-met";
  if (reqSpecial)
    reqSpecial.className = hasSpecial
      ? "fas fa-check-circle requirement-icon requirement-met"
      : "fas fa-times-circle requirement-icon requirement-not-met";

  // Mettre à jour la barre de force
  const passwordStrengthBar = document.getElementById("passwordStrengthBar");
  const passwordStrengthText = document.getElementById("passwordStrengthText");
  const passwordScore = document.getElementById("passwordScore");

  if (passwordStrengthBar) {
    passwordStrengthBar.style.width = `${score}%`;
    passwordStrengthBar.className = "password-strength-bar";

    if (score <= 40) {
      passwordStrengthBar.classList.add("strength-weak");
      if (passwordStrengthText) passwordStrengthText.textContent = "Faible";
    } else if (score <= 80) {
      passwordStrengthBar.classList.add("strength-medium");
      if (passwordStrengthText) passwordStrengthText.textContent = "Moyen";
    } else {
      passwordStrengthBar.classList.add("strength-strong");
      if (passwordStrengthText) passwordStrengthText.textContent = "Fort";
    }
  }

  if (passwordScore) passwordScore.textContent = `${score}%`;
}

function checkPasswordMatch() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const passwordMatchMessage = document.getElementById("passwordMatchMessage");

  if (confirmPassword.length === 0) {
    passwordMatchMessage.innerHTML = "";
    return;
  }

  if (password === confirmPassword) {
    passwordMatchMessage.innerHTML = `
            <i class="fas fa-check-circle match-success"></i>
            <span class="match-success">Les mots de passe correspondent</span>
        `;
  } else {
    passwordMatchMessage.innerHTML = `
            <i class="fas fa-times-circle match-error"></i>
            <span class="match-error">Les mots de passe ne correspondent pas</span>
        `;
  }
}

// ==================== GESTION DES PAYS ====================
let africanCountries = [];

async function loadAfricanCountries() {
  try {
    // Charger les pays...
  } catch (error) {
    console.error("Erreur lors du chargement des pays:", error);
    africanCountries = getFallbackAfricanCountries();
  }
}

function getFallbackAfricanCountries() {
  return [
    { name: "Cameroun", code: "CM", flag: "🇨🇲", phone_code: "+237" },
    // ... autres pays
  ];
}

// ==================== GESTION DES ÉTUDES ====================
function setupEducationFields() {
  const typeEtudeSelect = document.getElementById("typeEtude");
  const niveauEtudeSelect = document.getElementById("niveauEtude");

  if (!typeEtudeSelect || !niveauEtudeSelect) return;

  const niveauxOptions = {
    universitaire: [
      { value: "l1", label: "Licence 1 (L1)" },
      { value: "l2", label: "Licence 2 (L2)" },
      { value: "l3", label: "Licence 3 (L3)" },
      { value: "m1", label: "Master 1 (M1)" },
      { value: "m2", label: "Master 2 (M2)" },
      { value: "doctorat", label: "Doctorat" },
      { value: "ingenieur", label: "Cycle ingénieur" },
    ],
    // ... autres options
  };

  typeEtudeSelect.addEventListener("change", function () {
    const selectedType = this.value;
    updateNiveauOptions(selectedType, niveauEtudeSelect, niveauxOptions);
  });
}

// ==================== VALIDATION DU FORMULAIRE ====================
function validateForm() {
  const errors = [];

  // Validation des champs requis
  const requiredFields = [
    { id: "nom", name: "Nom" },
    { id: "prenom", name: "Prénom" },
    { id: "email", name: "Email" },
    { id: "password", name: "Mot de passe" },
    { id: "confirmPassword", name: "Confirmation mot de passe" },
  ];

  requiredFields.forEach((field) => {
    const element = document.getElementById(field.id);
    if (element && !element.value.trim()) {
      errors.push({
        field: field.id,
        message: `${field.name} est requis`,
      });
    }
  });

  // Validation du sexe
  const sexeSelected = document.querySelector('input[name="sexe"]:checked');
  if (!sexeSelected) {
    errors.push({
      field: "sexe",
      message: "Veuillez sélectionner votre sexe",
    });
  }

  // Validation des études
  const typeEtude = document.getElementById("typeEtude");
  const niveauEtude = document.getElementById("niveauEtude");

  if (typeEtude && !typeEtude.value) {
    errors.push({
      field: "typeEtude",
      message: "Veuillez sélectionner un type d'étude",
    });
  }

  if (niveauEtude && !niveauEtude.value) {
    errors.push({
      field: "niveauEtude",
      message: "Veuillez sélectionner un niveau d'étude",
    });
  }

  // Validation du pays
  const paysSelected = document.getElementById("paysSelected");
  if (!paysSelected || !paysSelected.value) {
    errors.push({
      field: "paysInput",
      message: "Veuillez sélectionner un pays",
    });
  }

  // Validation du téléphone
  const telephone = document.getElementById("telephone");
  const countryCode = document.getElementById("countryCode");
  if (telephone && telephone.value.replace(/\D/g, "").length < 8) {
    errors.push({
      field: "telephone",
      message: "Le numéro doit contenir au moins 8 chiffres",
    });
  }

  if (!countryCode || !countryCode.value) {
    errors.push({
      field: "telephone",
      message: "Veuillez sélectionner un pays d'abord",
    });
  }

  // Validation de l'email format
  const email = document.getElementById("email");
  if (email && email.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      errors.push({
        field: "email",
        message: "Format d'email invalide",
      });
    }
  }

  // Validation de la force du mot de passe
  const passwordScore = document.getElementById("passwordScore");
  if (passwordScore) {
    const score = parseInt(passwordScore.textContent);
    if (score < 60) {
      errors.push({
        field: "password",
        message:
          "Le mot de passe est trop faible. Améliorez-le pour continuer.",
      });
    }
  }

  return errors;
}

function displayFormErrors(errors) {
  errors.forEach((error) => {
    const fieldElement = document.getElementById(error.field);
    if (!fieldElement) return;

    let errorElement =
      fieldElement.parentElement.querySelector(".error-message");
    if (!errorElement) {
      errorElement =
        fieldElement.parentElement.parentElement.querySelector(
          ".error-message"
        );
    }

    if (errorElement) {
      errorElement.textContent = error.message;
      errorElement.classList.remove("hidden");
    }

    fieldElement.classList.add("border-red-500", "error-shake");
    setTimeout(() => fieldElement.classList.remove("error-shake"), 400);
  });
}

// ==================== SOUMISSION À FIREBASE ====================
async function handleFormSubmit(e) {
  e.preventDefault(); // IMPORTANT : empêche l'envoi dans l'URL

  // Réinitialiser les erreurs
  resetFormErrors();

  // Valider le formulaire
  const errors = validateForm();

  if (errors.length > 0) {
    displayFormErrors(errors);
    showNotification(
      "Veuillez corriger les erreurs dans le formulaire",
      "error"
    );
    return;
  }

  // Vérifier que Firebase est initialisé
  if (!db || !auth) {
    showNotification(
      "Erreur de connexion à la base de données. Veuillez rafraîchir la page.",
      "error"
    );
    return;
  }

  // Activer l'état de chargement
  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");

  submitBtn.disabled = true;
  btnText.classList.add("hidden");
  btnLoader.classList.remove("hidden");

  try {
    // Récupérer les données du formulaire
    const formData = {
      nom: document.getElementById("nom").value.trim(),
      prenom: document.getElementById("prenom").value.trim(),
      sexe: document.querySelector('input[name="sexe"]:checked').value,
      langue: document.getElementById("langue").value,
      email: document.getElementById("email").value.trim(),
      typeEtude: document.getElementById("typeEtude").value,
      niveauEtude: document.getElementById("niveauEtude").value,
      pays: document.getElementById("paysSelected").value,
      telephone:
        document.getElementById("countryCode").value +
        document.getElementById("telephone").value.replace(/\D/g, ""),
    };

    const password = document.getElementById("password").value;

    console.log("Données à envoyer à Firebase:", formData);

    // 1. Créer l'utilisateur dans Firebase Authentication
    const userCredential = await auth.createUserWithEmailAndPassword(
      formData.email,
      password
    );
    const user = userCredential.user;

    // 2. Mettre à jour le profil
    await user.updateProfile({
      displayName: `${formData.prenom} ${formData.nom}`,
    });

    // 3. Préparer les données pour Firestore
    const studentData = {
      uid: user.uid,
      email: formData.email,
      nom: formData.nom,
      prenom: formData.prenom,
      nomComplet: `${formData.prenom} ${formData.nom}`,
      sexe: formData.sexe,
      langue: formData.langue,
      typeEtude: formData.typeEtude,
      niveauEtude: formData.niveauEtude,
      pays: formData.pays,
      telephone: formData.telephone,
      role: "etudiant",
      statut: "actif",
      dateInscription: firebase.firestore.FieldValue.serverTimestamp(),
      dateCreation: new Date().toISOString(),
      photoURL: "",
      preferences: {
        notifications: true,
        emails: true,
        visibilite: "public",
      },
    };

    // 4. Ajouter à la collection "etudiants"
    const studentRef = await db.collection("etudiants").add(studentData);
    console.log("Étudiant ajouté avec ID:", studentRef.id);

    // 5. Créer un document dans "users"
    const userGeneralData = {
      uid: user.uid,
      email: formData.email,
      nom: formData.nom,
      prenom: formData.prenom,
      role: "etudiant",
      dateCreation: firebase.firestore.FieldValue.serverTimestamp(),
      derniereConnexion: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("users").add(userGeneralData);

    // Succès
    showNotification(
      "Inscription réussie ! Redirection vers la page de connexion...",
      "success"
    );

    // Réinitialiser le formulaire
    setTimeout(() => {
      // Réinitialiser les champs
      document.getElementById("registrationForm").reset();

      // Réinitialiser les champs spécifiques
      const paysInput = document.getElementById("paysInput");
      const paysSelected = document.getElementById("paysSelected");
      const countryCode = document.getElementById("countryCode");
      if (paysInput) paysInput.value = "";
      if (paysSelected) paysSelected.value = "";
      if (countryCode) countryCode.value = "";

      // Réinitialiser la force du mot de passe
      const passwordStrengthBar = document.getElementById(
        "passwordStrengthBar"
      );
      const passwordStrengthText = document.getElementById(
        "passwordStrengthText"
      );
      const passwordScore = document.getElementById("passwordScore");
      if (passwordStrengthBar) passwordStrengthBar.style.width = "0%";
      if (passwordStrengthText)
        passwordStrengthText.textContent = "Force du mot de passe";
      if (passwordScore) passwordScore.textContent = "";

      // Rediriger vers la page de connexion
      window.location.href = "Connexion.html?newStudent=true";
    }, 3000);
  } catch (error) {
    console.error("Erreur Firebase:", error);

    let errorMessage = "Une erreur est survenue lors de l'inscription.";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Cet email est déjà utilisé. Essayez de vous connecter.";
        break;
      case "auth/invalid-email":
        errorMessage = "L'adresse email n'est pas valide.";
        break;
      case "auth/weak-password":
        errorMessage =
          "Le mot de passe est trop faible. Utilisez au moins 6 caractères.";
        break;
      case "auth/operation-not-allowed":
        errorMessage =
          "L'inscription par email/mot de passe n'est pas activée.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Problème de connexion internet. Veuillez réessayer.";
        break;
      case "permission-denied":
        errorMessage = "Permission refusée. Contactez l'administrateur.";
        break;
    }

    showNotification(errorMessage, "error");
  } finally {
    // Désactiver l'état de chargement
    submitBtn.disabled = false;
    btnText.classList.remove("hidden");
    btnLoader.classList.add("hidden");
  }
}

// ==================== NAVIGATION ENTRE LES ÉTAPES ====================
document.getElementById("nextBtn").addEventListener("click", function () {
  // Valider l'étape 1 d'abord
  const step1Valid = validateStep1();
  if (step1Valid) {
    // Cacher l'étape 1
    document.querySelector('[data-step="1"]').classList.add("hidden");
    // Afficher l'étape 2
    document.querySelector('[data-step="2"]').classList.remove("hidden");

    // Mettre à jour l'indicateur d'étape
    updateStepIndicator(1);
  }
});

document.getElementById("backBtn").addEventListener("click", function () {
  // Cacher l'étape 2
  document.querySelector('[data-step="2"]').classList.add("hidden");
  // Afficher l'étape 1
  document.querySelector('[data-step="1"]').classList.remove("hidden");

  // Mettre à jour l'indicateur d'étape
  updateStepIndicator(0);
});

function validateStep1() {
  // Votre validation existante
  const requiredFields = [
    "nom",
    "prenom",
    "email",
    "password",
    "confirmPassword",
  ];
  let isValid = true;

  requiredFields.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add("border-red-500");
    } else {
      field.classList.remove("border-red-500");
    }
  });

  // Vérifier si un sexe est sélectionné
  const sexeSelected = document.querySelector('input[name="sexe"]:checked');
  if (!sexeSelected) {
    isValid = false;
  }

  // Vérifier la correspondance des mots de passe
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  if (password !== confirmPassword) {
    isValid = false;
    document.getElementById("confirmPassword").classList.add("border-red-500");
  }

  return isValid;
}

function updateStepIndicator(activeStep) {
  // Votre code existant pour mettre à jour l'indicateur d'étape
  document.querySelectorAll(".step").forEach((step, index) => {
    if (index <= activeStep) {
      step
        .querySelector("div")
        .classList.remove("bg-gray-300", "dark:bg-gray-600");
      step
        .querySelector("div")
        .classList.add("bg-gradient-to-r", "from-blue-600", "to-blue-700");
      step.querySelector("div").classList.add("text-white");
    } else {
      step
        .querySelector("div")
        .classList.remove(
          "bg-gradient-to-r",
          "from-blue-600",
          "to-blue-700",
          "text-white"
        );
      step
        .querySelector("div")
        .classList.add("bg-gray-300", "dark:bg-gray-600");
    }
  });
}

// ==================== INITIALISATION ====================
document.addEventListener("DOMContentLoaded", async function () {
  console.log("Initialisation de l'inscription étudiant...");

  // Configurer les événements
  document
    .getElementById("password")
    .addEventListener("input", checkPasswordStrength);
  document
    .getElementById("confirmPassword")
    .addEventListener("input", checkPasswordMatch);

  // Charger les pays
  await loadAfricanCountries();

  // Configurer les champs d'étude
  setupEducationFields();

  // S'assurer que le formulaire ne soumet pas par défaut
  const form = document.getElementById("registrationForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
    form.method = "post"; // Changer de GET à POST
  }
});
