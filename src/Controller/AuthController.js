// controllers/AuthController.js
import { authService } from "../Service/authService.js";
import { showNotification } from "../utils/notifications.js";

export class AuthController {
  constructor() {
    this.currentUser = null;
    this.unsubscribeAuth = null;
  }

  // ── Initialisation ───────────────────────────────────────────
  init() {
    // Écouter les changements d'authentification
    this.setupAuthListener();

    // Initialiser les formulaires si présents
    this.setupLoginForm();
    this.setupRegisterForms();
    this.setupLogoutButtons();

    console.log("AuthController initialisé");
  }

  // ── Écouteur authentification ────────────────────────────────
  setupAuthListener() {
    this.unsubscribeAuth = authService.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.updateUIForAuthState(user);

      if (user) {
        this.redirectBasedOnRole(user);
      }
    });
  }

  // ── Formulaire connexion ─────────────────────────────────────
  setupLoginForm() {
    const loginForm = document.querySelector("#login-form");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = loginForm.querySelector("#email").value.trim();
      const password = loginForm.querySelector("#password").value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      // Validation basique
      if (!email || !password) {
        this.showError("Veuillez remplir tous les champs");
        return;
      }

      // Désactiver le bouton pendant le traitement
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Connexion en cours...";

      try {
        const result = await authService.login(email, password);

        this.showSuccess(result.message);
        this.handleSuccessfulLogin(result.user);
      } catch (error) {
        this.showError(error.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // ── Formulaires inscription ──────────────────────────────────
  setupRegisterForms() {
    // Inscription étudiant
    const etudiantForm = document.querySelector("#register-etudiant-form");
    if (etudiantForm) {
      etudiantForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.handleRegister(e.target, "etudiant");
      });
    }

    // Inscription tuteur
    const tuteurForm = document.querySelector("#register-tuteur-form");
    if (tuteurForm) {
      tuteurForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.handleRegister(e.target, "tuteur");
      });
    }
  }

  // ── Boutons déconnexion ──────────────────────────────────────
  setupLogoutButtons() {
    document.addEventListener("click", (e) => {
      if (
        e.target.matches("[data-logout]") ||
        e.target.closest("[data-logout]")
      ) {
        e.preventDefault();
        this.handleLogout();
      }
    });
  }

  // ── Traitement inscription ───────────────────────────────────
  async handleRegister(form, userType) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = "Inscription en cours...";

    try {
      // Récupérer les données du formulaire
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      const email = data.email;
      const password = data.password;
      const confirmPassword = data.confirmPassword;

      // Validation
      if (password !== confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas");
      }

      if (password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      }

      // Inscription
      let result;
      if (userType === "etudiant") {
        result = await authService.registerEtudiant(email, password, data);
      } else {
        result = await authService.registerTuteur(email, password, data);
      }

      this.showSuccess(result.message);

      // Redirection ou actions post-inscription
      if (result.user) {
        setTimeout(() => {
          window.location.hash = "#/verification-email";
        }, 2000);
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  // ── Déconnexion ──────────────────────────────────────────────
  async handleLogout() {
    if (!confirm("Voulez-vous vraiment vous déconnecter ?")) {
      return;
    }

    try {
      const result = await authService.logout();
      this.showSuccess(result.message);

      // Redirection après déconnexion
      setTimeout(() => {
        window.location.hash = "#/connexion";
      }, 1000);
    } catch (error) {
      this.showError(error.message);
    }
  }

  // ── Connexion réussie ────────────────────────────────────────
  handleSuccessfulLogin(user) {
    // Stocker l'utilisateur dans le sessionStorage
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    // Notification
    const welcomeMessage = `Bienvenue ${
      user.prenom || user.nomComplet || user.email
    } !`;
    this.showSuccess(welcomeMessage);

    // Redirection
    this.redirectBasedOnRole(user);
  }

  // ── Redirection selon rôle ───────────────────────────────────
  redirectBasedOnRole(user) {
    // Attendre un peu pour la notification
    setTimeout(() => {
      if (user.typeUtilisateur === "tuteur") {
        window.location.hash = "#/tuteur/dashboard";
      } else if (user.typeUtilisateur === "etudiant") {
        window.location.hash = "#/etudiant/dashboard";
      } else {
        window.location.hash = "#/";
      }
    }, 1500);
  }

  // ── Mise à jour UI ───────────────────────────────────────────
  updateUIForAuthState(user) {
    // Cacher/montrer les éléments selon l'état d'authentification
    const authElements = document.querySelectorAll("[data-auth]");
    const guestElements = document.querySelectorAll("[data-guest]");

    if (user) {
      // Utilisateur connecté
      authElements.forEach((el) => (el.style.display = ""));
      guestElements.forEach((el) => (el.style.display = "none"));

      // Mettre à jour le nom d'utilisateur
      const userNameElements = document.querySelectorAll("[data-user-name]");
      userNameElements.forEach((el) => {
        el.textContent = user.prenom || user.nomComplet || user.email;
      });
    } else {
      // Utilisateur non connecté
      authElements.forEach((el) => (el.style.display = "none"));
      guestElements.forEach((el) => (el.style.display = ""));
    }
  }

  // ── Notifications ────────────────────────────────────────────
  showError(message) {
    // Utiliser votre système de notification ou un simple alert
    if (typeof showNotification === "function") {
      showNotification(message, "error");
    } else {
      alert(`❌ ${message}`);
    }
  }

  showSuccess(message) {
    if (typeof showNotification === "function") {
      showNotification(message, "success");
    } else {
      alert(`✅ ${message}`);
    }
  }

  // ── Nettoyage ────────────────────────────────────────────────
  destroy() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }
}

// Export singleton
export const authController = new AuthController();
