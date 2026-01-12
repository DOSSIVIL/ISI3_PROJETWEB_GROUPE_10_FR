// ==================== CONFIGURATION FIREBASE ====================
const firebaseConfig = {
  apiKey: "AIzaSyAHnlS177olRKu3WJBO-yTQsd4vNI0MIFs",
  authDomain: "achitectureweb-groupe-10.firebaseapp.com",
  projectId: "achitectureweb-groupe-10",
  storageBucket: "achitectureweb-groupe-10.firebasestorage.app",
  messagingSenderId: "646899550480",
  appId: "1:646899550480:web:687fd4f4b2e0ca646efd95",
};

// Variables globales pour Firebase
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseInitialized = false;

// ==================== VARIABLES GLOBALES UTILISATEUR ====================
let userEmail = null;
let userCategory = null;

// ==================== FONCTIONS POUR GARDER LES INFOS ====================
function saveUserInfo(email, category) {
  userEmail = email;
  userCategory = category;

  const userInfo = {
    email: email,
    category: category,
  };

  sessionStorage.setItem("user_info", JSON.stringify(userInfo));
}

function getUserInfo() {
  // D'abord vérifier les variables
  if (userEmail && userCategory) {
    return {
      email: userEmail,
      category: userCategory,
    };
  }

  // Sinon vérifier sessionStorage
  const stored = sessionStorage.getItem("user_info");
  if (stored) {
    const info = JSON.parse(stored);
    userEmail = info.email;
    userCategory = info.category;
    return info;
  }

  return null;
}

function clearUserInfo() {
  userEmail = null;
  userCategory = null;
  sessionStorage.removeItem("user_info");
}

// Dans Connexion.html, ajoutez ce code
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);

  // 1. Vérifier si l'utilisateur vient de confirmer son email
  const verified = urlParams.get("verified");
  const emailVerified = urlParams.get("emailVerified");
  const mode = urlParams.get("mode");
  const oobCode = urlParams.get("oobCode");

  if (verified === "true" || emailVerified === "true") {
    showNotification(
      "✅ Email confirmé avec succès ! Vous pouvez maintenant vous connecter.",
      "success"
    );

    // Nettoyer l'URL
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  // 2. Si c'est un callback de confirmation Firebase
  if (mode && oobCode) {
    handleFirebaseCallback(mode, oobCode);
  }
});

// Fonction pour gérer le callback de Firebase
async function handleFirebaseCallback(mode, oobCode) {
  try {
    console.log("🔗 Traitement callback Firebase:", { mode, oobCode });

    if (!firebaseAuth) {
      showNotification("Firebase non initialisé", "error");
      return;
    }

    const auth = firebase.auth();

    switch (mode) {
      case "verifyEmail":
        await auth.applyActionCode(oobCode);
        showNotification(
          "🎉 Email confirmé avec succès ! Vous pouvez maintenant vous connecter.",
          "success"
        );
        break;

      case "resetPassword":
        const email = await auth.verifyPasswordResetCode(oobCode);
        showNotification(
          `Réinitialisation du mot de passe pour ${email}`,
          "info"
        );
        window.location.href = `/reset-password.html?oobCode=${oobCode}`;
        return;

      default:
        showNotification("Action Firebase non reconnue", "error");
        return;
    }

    setTimeout(() => {
      window.location.href =
        "/src/views/templates/Connexion.html?verified=true";
    }, 2000);
  } catch (error) {
    console.error("❌ Erreur callback Firebase:", error);
    let message = "Erreur lors de la confirmation de l'email";

    if (error.code === "auth/invalid-action-code") {
      message = "Le lien de confirmation est invalide ou a expiré";
    } else if (error.code === "auth/user-not-found") {
      message = "Utilisateur non trouvé";
    }

    showNotification(message, "error");
  }
}

// Fonction de connexion modifiée pour Firebase
async function loginUser(email, password) {
  try {
    if (!firebaseAuth) {
      throw new Error("Firebase non initialisé");
    }

    const auth = firebase.auth();
    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;

    if (!user.emailVerified) {
      await auth.signOut();
      showNotification(
        "❌ Email non vérifié. Vérifiez votre boîte mail.",
        "error"
      );
      addResendVerificationButton(email);
      return null;
    }

    return userCredential;
  } catch (error) {
    console.error("❌ Erreur connexion Firebase:", error);

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      showNotification("❌ Email ou mot de passe incorrect", "error");
    } else if (error.code === "auth/too-many-requests") {
      showNotification("❌ Trop de tentatives. Réessayez plus tard", "error");
    } else if (error.code === "auth/user-disabled") {
      showNotification("❌ Ce compte a été désactivé", "error");
    } else {
      showNotification("❌ Erreur de connexion: " + error.message, "error");
    }

    return null;
  }
}

// Fonction pour renvoyer la vérification d'email
async function resendVerification(email) {
  try {
    if (!firebaseAuth) {
      throw new Error("Firebase non initialisé");
    }

    const auth = firebase.auth();
    const user = auth.currentUser;

    if (user && user.email === email) {
      await user.sendEmailVerification({
        url: `${window.location.origin}/src/views/templates/Connexion.html?verified=true`,
        handleCodeInApp: true,
      });
    } else {
      showNotification(
        "❌ Connectez-vous d'abord pour renvoyer la vérification",
        "error"
      );
      return;
    }

    showNotification(
      "📧 Email de vérification renvoyé ! Vérifiez votre boîte mail.",
      "success"
    );
  } catch (error) {
    console.error("❌ Erreur renvoi vérification:", error);
    showNotification("❌ Erreur: " + error.message, "error");
  }
}

function addResendVerificationButton(email) {
  const notification = document.querySelector(".notification:last-child");
  if (!notification) return;

  const button = document.createElement("button");
  button.textContent = "Renvoyer la vérification";
  button.style.cssText = `
        margin-left: 10px;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        cursor: pointer;
    `;

  button.onclick = async () => {
    button.disabled = true;
    button.textContent = "Envoi...";
    await resendVerification(email);
    setTimeout(() => {
      button.disabled = false;
      button.textContent = "Renvoyer la vérification";
    }, 5000);
  };

  notification.appendChild(button);
}

// ==================== FONCTIONS UTILITAIRES ====================
function showNotification(message, type = "info", duration = 5000) {
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

  setTimeout(() => {
    if (notification.parentElement) {
      notification.classList.add("animate__fadeOutRight");
      setTimeout(() => notification.remove(), 500);
    }
  }, duration);
}

function resetFormErrors() {
  document.querySelectorAll(".error-message").forEach((el) => {
    el.classList.add("hidden");
    el.textContent = "";
  });

  document.querySelectorAll(".input-field").forEach((field) => {
    field.classList.remove("border-red-500", "error-shake");
    field.classList.add("border-gray-300");
  });
}

function validateLoginForm() {
  const errors = [];

  const email = document.getElementById("email");
  const password = document.getElementById("password");

  // Validation de l'email
  if (!email || !email.value.trim()) {
    errors.push({
      field: "email",
      message: "L'email est requis",
    });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      errors.push({
        field: "email",
        message: "Format d'email invalide",
      });
    }
  }

  // Validation du mot de passe
  if (!password || !password.value.trim()) {
    errors.push({
      field: "password",
      message: "Le mot de passe est requis",
    });
  } else if (password.value.length < 6) {
    errors.push({
      field: "password",
      message: "Le mot de passe doit contenir au moins 6 caractères",
    });
  }

  return errors;
}

function displayFormErrors(errors) {
  errors.forEach((error) => {
    const fieldElement = document.getElementById(error.field);
    if (fieldElement) {
      const errorElement =
        fieldElement.parentElement.querySelector(".error-message");
      if (errorElement) {
        errorElement.textContent = error.message;
        errorElement.classList.remove("hidden");
      }
      fieldElement.classList.add("error-shake", "border-red-500");
      setTimeout(() => fieldElement.classList.remove("error-shake"), 400);
    }
  });
}

// ==================== GESTION DES BOUTONS DE CONNEXION SOCIALE ====================
function setupSocialButtons() {
  // Bouton Google
  const googleBtn = document.querySelector(
    'button[class*="flex items-center justify-center gap-3"]'
  );
  if (googleBtn) {
    googleBtn.addEventListener("click", function (e) {
      e.preventDefault();
      showNotification(
        "La connexion avec Google n'est pas encore disponible. Utilisez l'inscription standard pour créer un compte.",
        "info",
        4000
      );

      this.classList.add("bg-gray-100", "border-gray-400");
      setTimeout(() => {
        this.classList.remove("bg-gray-100", "border-gray-400");
      }, 500);
    });
  }

  const socialBtns = document.querySelectorAll(".social-btn");
  socialBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      const socialName = this.querySelector("span").textContent;

      showNotification(
        `La connexion avec ${socialName} n'est pas encore implémentée. Utilisez l'inscription par email/mot de passe.`,
        "info",
        4000
      );

      const originalBg = this.style.backgroundColor;
      this.style.backgroundColor = "#6b7280";
      this.style.transform = "scale(0.95)";

      setTimeout(() => {
        this.style.backgroundColor = originalBg;
        this.style.transform = "";
      }, 300);
    });
  });
}

// ==================== GESTION DE LA VISIBILITÉ DU MOT DE PASSE ====================
function setupPasswordToggle() {
  const passwordToggle = document.querySelector(".eye-toggle");
  if (!passwordToggle) return;

  passwordToggle.addEventListener("click", function () {
    const input = this.previousElementSibling;
    if (!input) return;

    if (input.type === "password") {
      input.type = "text";
      this.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      input.type = "password";
      this.classList.replace("fa-eye-slash", "fa-eye");
    }
  });
}

// ==================== FONCTIONS DE SÉCURITÉ ====================

async function clearExistingSessions() {
  if (!firebaseAuth) return;

  try {
    console.log("🔒 Suppression des sessions Firebase...");

    const auth = firebase.auth();
    await auth.signOut();

    sessionStorage.removeItem("educonnect_user");
    sessionStorage.removeItem("firebase_user");
    localStorage.removeItem("firebase:authUser");

    document.cookie.split(";").forEach(function (c) {
      if (c.includes("firebase") || c.includes("auth")) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      }
    });

    console.log("✅ Sessions Firebase nettoyées");
  } catch (error) {
    console.error("Erreur lors du nettoyage des sessions:", error);
  }
}

function checkDirectAccess() {
  if (window.location.pathname.includes("connexion")) {
    return false;
  }

  const userData = sessionStorage.getItem("educonnect_user");

  if (!userData) {
    const redirectUrl = `/connexion?error=session_required&redirect=${encodeURIComponent(
      window.location.pathname
    )}`;
    window.location.href = redirectUrl;
    return true;
  }

  try {
    const user = JSON.parse(userData);
    const sessionTime = new Date(user.lastLogin);
    const now = new Date();
    const diffInMinutes = (now - sessionTime) / (1000 * 60);

    if (diffInMinutes > 15) {
      sessionStorage.removeItem("educonnect_user");
      window.location.href = `/connexion?error=session_expired`;
      return true;
    }

    return false;
  } catch (error) {
    sessionStorage.removeItem("educonnect_user");
    window.location.href = `/connexion?error=invalid_session`;
    return true;
  }
}

// ==================== RÉCUPÉRATION DU RÔLE UTILISATEUR ====================
async function getUserRole(userId) {
  if (!firebaseDb) return null;

  try {
    const db = firebase.firestore();

    // Vérifier si c'est un enseignant
    const enseignantRef = db.collection("enseignants").doc(userId);
    const enseignantSnap = await enseignantRef.get();

    if (enseignantSnap.exists) {
      const data = enseignantSnap.data();
      return data.role || "enseignant";
    }

    // Vérifier si c'est un étudiant
    const etudiantRef = db.collection("etudiants").doc(userId);
    const etudiantSnap = await etudiantRef.get();

    if (etudiantSnap.exists) {
      const data = etudiantSnap.data();
      return data.role || "etudiant";
    }

    return "utilisateur";
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    return null;
  }
}

// ==================== RÉCUPÉRATION DES DONNÉES UTILISATEUR ====================
async function getUserProfile(userId, role) {
  if (!firebaseDb) return null;

  try {
    const db = firebase.firestore();

    let collectionName = "";

    switch (role) {
      case "enseignant":
        collectionName = "enseignants";
        break;
      case "etudiant":
        collectionName = "etudiants";
        break;
      default:
        console.log("Rôle non reconnu");
        return null;
    }

    const userRef = db.collection(collectionName).doc(userId);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      return userSnap.data();
    } else {
      console.error(`Profil ${role} non trouvé pour ID:`, userId);
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return null;
  }
}

// ==================== GESTION DE LA CONNEXION SÉCURISÉE ====================
async function handleLogin(e) {
  e.preventDefault();

  resetFormErrors();

  const errors = validateLoginForm();

  if (errors.length > 0) {
    displayFormErrors(errors);
    showNotification(
      "Veuillez corriger les erreurs dans le formulaire",
      "error"
    );
    return;
  }

  if (!firebaseInitialized) {
    showNotification(
      "Erreur: Firebase non initialisé. Vérifiez votre connexion internet.",
      "error"
    );
    return;
  }

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");

  if (submitBtn && btnText && btnLoader) {
    submitBtn.disabled = true;
    btnText.classList.add("hidden");
    btnLoader.classList.remove("hidden");
  }

  try {
    console.log("🔐 Tentative de connexion Firebase pour:", email);

    await clearExistingSessions();

    const auth = firebase.auth();
    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;

    console.log("✅ Utilisateur authentifié:", user.uid);

    if (!user.emailVerified) {
      await auth.signOut();
      showNotification(
        "❌ Email non vérifié. Vérifiez votre boîte mail.",
        "error"
      );
      addResendVerificationButton(email);
      return;
    }

    const userRole = await getUserRole(user.uid);
    console.log("🎯 Rôle détecté:", userRole);

    let userProfile = null;
    if (userRole) {
      userProfile = await getUserProfile(user.uid, userRole);
    }

    // ==================== SAUVEGARDER LES INFOS ====================
    saveUserInfo(user.email, userRole);
    console.log("📝 Infos sauvegardées:", user.email, userRole);
    // ==============================================================

    const sessionId =
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    const userSessionData = {
      id: user.uid,
      email: user.email,
      role: userRole,
      profile: userProfile,
      loggedIn: true,
      lastLogin: new Date().toISOString(),
      sessionId: sessionId,
      ip: await getClientIP(),
      userAgent: navigator.userAgent,
    };

    sessionStorage.removeItem("educonnect_user");
    sessionStorage.setItem("educonnect_user", JSON.stringify(userSessionData));
    sessionStorage.setItem("educonnect_session_start", Date.now().toString());

    console.log("📝 Session Firebase créée avec ID:", sessionId);

    let welcomeMessage = `Connexion sécurisée réussie!`;
    if (userProfile) {
      const displayName =
        userProfile.display_name ||
        userProfile.prenom ||
        user.email.split("@")[0];
      welcomeMessage = `Bienvenue ${displayName}! Session sécurisée activée.`;
    }

    showNotification(welcomeMessage, "success", 3000);

    setTimeout(() => {
      const redirectToken = btoa(Date.now() + "|" + sessionId);
      sessionStorage.setItem("redirect_token", redirectToken);

      let redirectUrl = "/dashboard/";
      if (userRole === "enseignant") {
        redirectUrl = `/dashboard/tuteur.html?token=${redirectToken}`;
      } else if (userRole === "etudiant") {
        redirectUrl = `../templates/etudiantDashboard.html?token=${redirectToken}`;
      }

      console.log("🔄 Redirection vers:", redirectUrl);
      window.location.href = redirectUrl;
    }, 1500);
  } catch (error) {
    console.error("❌ Erreur lors de la connexion Firebase:", error);

    let errorMessage = "Échec de la connexion sécurisée.";

    if (error.code) {
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Identifiants incorrects. Veuillez réessayer.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Aucun compte trouvé avec cet email.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Mot de passe incorrect.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Trop de tentatives. Réessayez dans 15 minutes.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "Ce compte a été désactivé.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Problème de connexion internet.";
      } else {
        errorMessage = "Erreur Firebase: " + error.code;
      }
    } else if (error.message) {
      errorMessage = "Erreur: " + error.message;
    }

    showNotification(errorMessage, "error");

    await clearExistingSessions();
  } finally {
    if (submitBtn && btnText && btnLoader) {
      submitBtn.disabled = false;
      btnText.classList.remove("hidden");
      btnLoader.classList.add("hidden");
    }
  }
}

async function getClientIP() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return "unknown";
  }
}

// ==================== INITIALISATION DE FIREBASE ====================
async function initFirebase() {
  console.log("🔧 Initialisation de Firebase...");

  await clearExistingSessions();

  // Vérifier si Firebase est déjà chargé (version compatibilité)
  if (typeof firebase === "undefined") {
    console.log("📚 Chargement de la bibliothèque Firebase (v9 compat)...");

    // Charger Firebase 9 avec compatibilité
    const script = document.createElement("script");
    script.src =
      "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js";
    script.async = true;

    return new Promise((resolve, reject) => {
      script.onload = async () => {
        console.log("✅ Firebase App chargée");

        try {
          // Charger les services nécessaires
          const authScript = document.createElement("script");
          authScript.src =
            "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js";
          authScript.async = true;

          const firestoreScript = document.createElement("script");
          firestoreScript.src =
            "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js";
          firestoreScript.async = true;

          await Promise.all([
            new Promise((res) => {
              authScript.onload = () => {
                console.log("✅ Firebase Auth chargé");
                res();
              };
              authScript.onerror = reject;
              document.head.appendChild(authScript);
            }),
            new Promise((res) => {
              firestoreScript.onload = () => {
                console.log("✅ Firebase Firestore chargé");
                res();
              };
              firestoreScript.onerror = reject;
              document.head.appendChild(firestoreScript);
            }),
          ]);

          // Initialiser Firebase avec la syntaxe compatibilité
          firebaseApp = firebase.initializeApp(firebaseConfig);
          firebaseAuth = firebaseApp; // Dans la version compat, l'app contient tout
          firebaseDb = firebase.firestore();

          // Configurer la persistance
          await firebase
            .auth()
            .setPersistence(firebase.auth.Auth.Persistence.SESSION);

          firebaseInitialized = true;
          console.log("✅ Firebase initialisé avec succès (v9 compat)");

          // Vérifier et nettoyer les sessions résiduelles
          const auth = firebase.auth();
          const currentUser = auth.currentUser;
          if (currentUser) {
            console.log("⚠️ Session résiduelle détectée, déconnexion...");
            await auth.signOut();
            sessionStorage.removeItem("educonnect_user");
          }

          resolve();
        } catch (error) {
          console.error("❌ Erreur d'initialisation Firebase:", error);
          reject(error);
        }
      };

      script.onerror = (error) => {
        console.error("❌ Erreur de chargement de Firebase:", error);
        reject(error);
      };

      document.head.appendChild(script);
    });
  } else {
    try {
      // Firebase est déjà chargé (v8 ou v9 compat)
      if (!firebase.apps || firebase.apps.length === 0) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
      } else {
        firebaseApp = firebase.app();
      }

      firebaseAuth = firebaseApp;
      firebaseDb = firebase.firestore ? firebase.firestore() : null;

      // Configurer la persistance si disponible
      if (firebase.auth && firebase.auth().setPersistence) {
        await firebase
          .auth()
          .setPersistence(firebase.auth.Auth.Persistence.SESSION);
      }

      firebaseInitialized = true;
      console.log("✅ Firebase initialisé (déjà chargé)");

      // Nettoyer les sessions résiduelles
      if (firebase.auth && firebase.auth().currentUser) {
        console.log("⚠️ Session résiduelle détectée, déconnexion...");
        await firebase.auth().signOut();
        sessionStorage.removeItem("educonnect_user");
      }

      return Promise.resolve();
    } catch (error) {
      console.error("❌ Erreur d'initialisation Firebase:", error);
      return Promise.reject(error);
    }
  }
}

// ==================== GESTION DES LIENS "MOT DE PASSE OUBLIÉ" ====================
function setupForgotPassword() {
  const forgotPasswordLink = document.querySelector(".forgot-password");
  if (!forgotPasswordLink) return;

  forgotPasswordLink.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!email) {
      showNotification("Veuillez entrer votre email", "error");
      return;
    }

    if (!firebaseInitialized) {
      showNotification("Erreur: Firebase non initialisé", "error");
      return;
    }

    try {
      const auth = firebase.auth();
      await auth.sendPasswordResetEmail(email, {
        url: `${window.location.origin}/reset-password.html`,
        handleCodeInApp: true,
      });

      showNotification(
        "📧 Email de réinitialisation envoyé ! Vérifiez votre boîte mail.",
        "success"
      );
    } catch (error) {
      console.error("Erreur réinitialisation Firebase:", error);

      if (error.code === "auth/user-not-found") {
        showNotification("❌ Aucun compte trouvé avec cet email", "error");
      } else if (error.code === "auth/too-many-requests") {
        showNotification("❌ Trop de tentatives. Réessayez plus tard", "error");
      } else {
        showNotification("❌ Erreur lors de l'envoi de l'email", "error");
      }
    }
  });
}

// ==================== VÉRIFICATION DES PARAMÈTRES URL ====================
function checkUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has("error")) {
    const errorType = urlParams.get("error");
    let message = "";

    switch (errorType) {
      case "session_required":
        message = "Connexion requise pour accéder à cette page";
        break;
      case "session_expired":
        message = "Votre session a expiré pour des raisons de sécurité";
        break;
      case "invalid_session":
        message = "Session invalide. Veuillez vous reconnecter";
        break;
      case "direct_access":
        message = "Accès direct non autorisé. Connectez-vous d'abord";
        break;
    }

    if (message) {
      showNotification(message, "error");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  if (urlParams.has("newUser")) {
    showNotification("Compte créé! Connectez-vous maintenant.", "success");
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  if (urlParams.has("emailVerified")) {
    showNotification("✅ Email vérifié avec succès !", "success");
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// ==================== INITIALISATION DE LA PAGE ====================
document.addEventListener("DOMContentLoaded", async function () {
  console.log("🚀 Page de connexion Firebase - Chargement...");

  checkUrlParameters();

  setupPasswordToggle();
  setupForgotPassword();
  setupSocialButtons();

  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", handleLogin);
  }

  try {
    await initFirebase();
    console.log("✅ Page de connexion Firebase prête - Sessions nettoyées");
  } catch (error) {
    console.error("❌ Échec de l'initialisation Firebase:", error);

    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-exclamation-triangle mr-2"></i> Service temporairement indisponible';
      submitBtn.classList.add("bg-red-500", "cursor-not-allowed");
      showNotification(
        "Le service d'authentification est en maintenance",
        "error"
      );
    }
  }

  const emailField = document.getElementById("email");
  if (emailField) {
    emailField.focus();
  }

  console.log("🎯 Initialisation Firebase terminée - Connexion requise");
});

// ==================== FONCTIONS GLOBALES ====================
window.firebaseFunctions = {
  clearExistingSessions,
  checkDirectAccess,
  handleLogin,
  validateLoginForm,
  setupSocialButtons,
  initFirebase,

  // ==================== AJOUT DES FONCTIONS UTILISATEUR ====================
  saveUserInfo,
  getUserInfo,
  clearUserInfo,
};
