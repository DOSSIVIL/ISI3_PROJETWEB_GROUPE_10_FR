// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAHnlS177olRKu3WJBO-yTQsd4vNI0MIFs",
    authDomain: "achitectureweb-groupe-10.firebaseapp.com",
    projectId: "achitectureweb-groupe-10",
    storageBucket: "achitectureweb-groupe-10.firebasestorage.app",
    messagingSenderId: "646899550480",
    appId: "1:646899550480:web:687fd4f4b2e0ca646efd95"
};

// Initialiser Firebase une seule fois
let app, auth, db;
try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("Firebase initialisé");
} catch (error) {
    if (error.code === 'app/duplicate-app') {
        app = firebase.app();
        auth = firebase.auth();
        db = firebase.firestore();
        console.log("Firebase déjà initialisé");
    } else {
        console.error("Erreur d'initialisation Firebase:", error);
    }
}

// Éléments DOM - Adaptés à votre structure HTML
const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const eyeToggle = document.querySelector('.eye-toggle');
const emailError = emailInput?.parentElement?.nextElementSibling;
const passwordError = passwordInput?.parentElement?.nextElementSibling;

// Variable pour empêcher la double soumission
let isSubmitting = false;

// Fonction de notification - adaptée à vos styles existants
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => {
        n.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => n.remove(), 300);
    });
    
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'success' ? 'notification-success' : 'notification-error'}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 300px;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        font-family: 'Poppins', sans-serif;
    `;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const title = type === 'success' ? 'Succès !' : 'Erreur !';
    
    notification.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
            <i class="fas ${icon}" style="font-size: 20px; margin-top: 2px;"></i>
            <div>
                <p style="font-weight: 600; margin: 0 0 5px 0; font-size: 15px;">${title}</p>
                <p style="margin: 0; font-size: 14px; opacity: 0.9; line-height: 1.4;">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Fonction pour vérifier si l'utilisateur est inscrit dans le système
async function checkUserRegistration(userId) {
    try {
        // D'abord vérifier dans la collection users
        const userDoc = await db.collection('users')
            .where('uid', '==', userId)
            .limit(1)
            .get();
        
        if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            console.log("Utilisateur trouvé dans 'users':", userData);
            return { 
                role: userData.role?.toLowerCase() || null,
                data: userData,
                collection: 'users',
                docId: userDoc.docs[0].id
            };
        }
        
        console.log("Utilisateur non trouvé dans 'users', recherche dans collections spécifiques...");
        
        // Si pas dans users, vérifier dans les collections spécifiques
        const [etudiantDoc, enseignantDoc] = await Promise.all([
            db.collection('etudiants')
                .where('uid', '==', userId)
                .limit(1)
                .get(),
            db.collection('enseignants')
                .where('uid', '==', userId)
                .limit(1)
                .get()
        ]);
        
        if (etudiantDoc.empty && enseignantDoc.empty) {
            console.log("Utilisateur non trouvé dans aucune collection");
            return null;
        }
        
        // Retourner le rôle selon la collection
        if (!etudiantDoc.empty) {
            const etudiantData = etudiantDoc.docs[0].data();
            console.log("Étudiant trouvé:", etudiantData);
            return { 
                role: 'etudiant', 
                data: etudiantData,
                collection: 'etudiants',
                docId: etudiantDoc.docs[0].id
            };
        } else {
            const enseignantData = enseignantDoc.docs[0].data();
            console.log("Enseignant trouvé:", enseignantData);
            return { 
                role: 'enseignant', 
                data: enseignantData,
                collection: 'enseignants',
                docId: enseignantDoc.docs[0].id
            };
        }
        
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'inscription:', error);
        return null;
    }
}

// Fonction pour mettre à jour la dernière connexion
async function updateLastLogin(userId, registration) {
    try {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        
        // Mettre à jour dans la collection appropriée
        if (registration.collection && registration.docId) {
            await db.collection(registration.collection)
                .doc(registration.docId)
                .update({
                    derniereConnexion: timestamp
                });
            console.log(`Dernière connexion mise à jour dans ${registration.collection}`);
        }
        
        // Mettre à jour aussi dans la collection users si différente
        if (registration.collection !== 'users') {
            const userDoc = await db.collection('users')
                .where('uid', '==', userId)
                .limit(1)
                .get();
            
            if (!userDoc.empty) {
                await db.collection('users')
                    .doc(userDoc.docs[0].id)
                    .update({
                        derniereConnexion: timestamp
                    });
                console.log("Dernière connexion mise à jour dans 'users'");
            }
        }
    } catch (error) {
        console.warn('Erreur lors de la mise à jour de la dernière connexion:', error);
        // Ne pas throw l'erreur, c'est une mise à jour secondaire
    }
}

// Gestion de l'affichage/masquage du mot de passe
if (eyeToggle) {
    eyeToggle.addEventListener('click', function() {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        this.className = isPassword ? 'fas fa-eye-slash eye-toggle absolute right-4 top-4 text-gray-400' : 'fas fa-eye eye-toggle absolute right-4 top-4 text-gray-400';
    });
}

// Fonction pour réinitialiser les erreurs
function resetErrors() {
    // Réinitialiser les styles des champs
    if (emailInput) {
        emailInput.classList.remove('border-red-500', 'error-shake');
        emailInput.classList.add('input-field');
    }
    if (passwordInput) {
        passwordInput.classList.remove('border-red-500', 'error-shake');
        passwordInput.classList.add('input-field');
    }
    
    // Cacher les messages d'erreur
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.classList.add('hidden');
        error.textContent = '';
    });
}

// Fonction pour afficher une erreur
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    let errorElement = field?.parentElement?.nextElementSibling;
    
    // Si l'élément d'erreur n'existe pas, le créer
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('p');
        errorElement.className = 'error-message text-red-500 text-xs mt-2 font-medium';
        errorElement.id = `${fieldId}Error`;
        field.parentElement.parentElement.appendChild(errorElement);
    }
    
    if (errorElement) {
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i> ${message}`;
        errorElement.classList.remove('hidden');
    }
    
    if (field) {
        field.classList.remove('input-field');
        field.classList.add('border-red-500', 'error-shake');
        setTimeout(() => field.classList.remove('error-shake'), 400);
    }
}

// Fonction pour valider le formulaire
function validateForm() {
    resetErrors();
    let isValid = true;
    
    // Validation Email
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        showError('email', 'L\'email est requis');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showError('email', 'Adresse email invalide');
        isValid = false;
    }
    
    // Validation Mot de passe
    const password = passwordInput.value;
    if (!password) {
        showError('password', 'Le mot de passe est requis');
        isValid = false;
    } else if (password.length < 6) {
        showError('password', 'Le mot de passe doit contenir au moins 6 caractères');
        isValid = false;
    }
    
    return isValid;
}

// Fonction pour afficher le loader
function showLoading() {
    if (btnText) btnText.classList.add('hidden');
    if (btnLoader) btnLoader.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;
    submitBtn.classList.add('opacity-80', 'cursor-not-allowed');
    isSubmitting = true;
}

// Fonction pour masquer le loader
function hideLoading() {
    if (btnText) btnText.classList.remove('hidden');
    if (btnLoader) btnLoader.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
    isSubmitting = false;
}

// Fonction principale de connexion
async function handleLogin(email, password) {
    try {
        // Tentative de connexion Firebase
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log("Utilisateur connecté à Firebase:", user.uid);
        
        // Vérifier l'inscription de l'utilisateur
        const registration = await checkUserRegistration(user.uid);
        
        if (!registration) {
            // Aucune inscription trouvée
            await auth.signOut();
            showNotification('Vous n\'êtes pas inscrit dans le système. Veuillez d\'abord vous inscrire.', 'error');
            return false;
        }
        
        const userRole = registration.role;
        console.log("Rôle détecté:", userRole);
        
        // Vérifier si c'est un enseignant ou un étudiant
        if (userRole !== 'enseignant' && userRole !== 'etudiant') {
            // Rôle non autorisé
            await auth.signOut();
            showNotification('Accès non autorisé. Contactez l\'administrateur.', 'error');
            return false;
        }
        
        // Mettre à jour la dernière connexion
        await updateLastLogin(user.uid, registration);
        
        // Succès - message selon le rôle
        let welcomeMessage = '';
        let userName = '';
        
        if (userRole === 'enseignant') {
            welcomeMessage = 'enseignant';
            userName = registration.data.nom || registration.data.prenom || '';
        } else if (userRole === 'etudiant') {
            welcomeMessage = 'étudiant';
            userName = registration.data.prenom || registration.data.nom || '';
        }
        
        const welcomeText = userName ? `, ${userName}` : '';
        showNotification(`Connexion réussie ! Bienvenue ${welcomeText} (${welcomeMessage}). Redirection...`, 'success');
        
        // Déterminer la page de redirection selon le rôle
        let redirectPage = '';
        if (userRole === 'enseignant') {
            redirectPage = '../../templates/Tableau_Bord_En.html';
        } else if (userRole === 'etudiant') {
            redirectPage = '../../templates/Tableau_Bord_Etu.html';
        }
        
        console.log("Redirection vers:", redirectPage);
        
        // Rediriger après 1 seconde
        setTimeout(() => {
            if (redirectPage) {
                window.location.href = redirectPage;
            }
        }, 1000);
        
        return true;
        
    } catch (error) {
        console.error('Erreur de connexion Firebase:', error);
        
        // Gestion des erreurs Firebase
        let errorMessage = 'Une erreur est survenue lors de la connexion.';
        let errorField = '';
        
        switch(error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Aucun compte trouvé avec cet email.';
                errorField = 'email';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Mot de passe incorrect.';
                errorField = 'password';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Format d\'email invalide.';
                errorField = 'email';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Ce compte a été désactivé.';
                errorField = 'email';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Problème de connexion internet.';
                break;
            case 'permission-denied':
                errorMessage = 'Permission refusée. Contactez l\'administrateur.';
                break;
            default:
                if (error.message.includes('permission')) {
                    errorMessage = 'Permission refusée. Contactez l\'administrateur.';
                } else {
                    errorMessage = `Erreur: ${error.message}`;
                }
        }
        
        if (errorField) {
            showError(errorField, errorMessage);
        }
        
        showNotification(errorMessage, 'error');
        return false;
    }
}

// Gestion de la soumission du formulaire
async function handleSubmit(e) {
    e.preventDefault();
    
    // Empêcher la double soumission
    if (isSubmitting) {
        console.log("Connexion déjà en cours...");
        return;
    }
    
    // Vérifier la connexion internet
    if (!navigator.onLine) {
        showNotification('Vous semblez être hors ligne. Vérifiez votre connexion internet.', 'error');
        return;
    }
    
    // Valider le formulaire
    if (!validateForm()) {
        showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
        return;
    }
    
    // Récupérer les données
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Afficher le loader
    showLoading();
    
    // Tenter la connexion
    const success = await handleLogin(email, password);
    
    // Masquer le loader (sauf si redirection en cours)
    if (!success) {
        hideLoading();
    }
}

// Validation en temps réel de l'email
if (emailInput) {
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            showError('email', 'Format d\'email invalide');
        } else {
            // Supprimer l'erreur si le champ est valide
            const errorElement = document.getElementById('emailError') || this.parentElement?.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.classList.add('hidden');
            }
            this.classList.remove('border-red-500');
            this.classList.add('input-field');
        }
    });
}

// Validation en temps réel du mot de passe
if (passwordInput) {
    passwordInput.addEventListener('blur', function() {
        const password = this.value;
        
        if (password && password.length < 6) {
            showError('password', 'Min. 6 caractères');
        } else {
            // Supprimer l'erreur si le champ est valide
            const errorElement = document.getElementById('passwordError') || this.parentElement?.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.classList.add('hidden');
            }
            this.classList.remove('border-red-500');
            this.classList.add('input-field');
        }
    });
}

// Attacher l'événement de soumission
if (form) {
    form.addEventListener('submit', handleSubmit);
}

// Vérifier si l'utilisateur est déjà connecté au chargement
document.addEventListener('DOMContentLoaded', function() {
    console.log("Page de connexion chargée");
    
    // Animation d'apparition
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        loginCard.style.opacity = '0';
        loginCard.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            loginCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            loginCard.style.opacity = '1';
            loginCard.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Vérifier l'état d'authentification
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log("Utilisateur déjà connecté à Firebase:", user.uid);
            
            // L'utilisateur est déjà connecté, vérifier son inscription
            const registration = await checkUserRegistration(user.uid);
            
            if (registration && (registration.role === 'enseignant' || registration.role === 'etudiant')) {
                // Rediriger selon le rôle
                let redirectPage = '';
                if (registration.role === 'enseignant') {
                    redirectPage = '../../templates/Tableau_Bord_En.html';
                } else if (registration.role === 'etudiant') {
                    redirectPage = '../../templates/Tableau_Bord_Etu.html';
                }
                
                if (redirectPage) {
                    console.log(`Utilisateur déjà connecté (${registration.role}), redirection vers ${redirectPage}...`);
                    
                    // Afficher un message avant redirection
                    showNotification(`Vous êtes déjà connecté en tant que ${registration.role}. Redirection...`, 'success');
                    
                    setTimeout(() => {
                        window.location.href = redirectPage;
                    }, 1500);
                }
            } else {
                // Déconnecter si l'utilisateur n'a pas d'inscription valide
                console.log("Utilisateur non inscrit, déconnexion...");
                await auth.signOut();
                showNotification('Votre compte n\'est pas inscrit dans le système. Veuillez vous inscrire d\'abord.', 'error');
            }
        } else {
            console.log("Aucun utilisateur connecté");
        }
    });
    
    // Ajouter des écouteurs pour les boutons sociaux (placeholders)
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.querySelector('span').textContent;
            showNotification(`Connexion avec ${platform} n'est pas encore disponible. Utilisez la connexion par email.`, 'error');
        });
    });
    
    // Gestionnaire pour le bouton Google
    const googleButton = document.querySelector('button[type="button"]:first-of-type');
    if (googleButton) {
        googleButton.addEventListener('click', function() {
            showNotification('Connexion avec Google n\'est pas encore disponible. Utilisez la connexion par email.', 'error');
        });
    }
    
    // Gestionnaire pour le lien "Mot de passe oublié"
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('La réinitialisation du mot de passe n\'est pas encore disponible. Contactez l\'administrateur.', 'error');
        });
    }
    
   
    
    console.log("Script de connexion initialisé avec succès");
});

// Gestionnaire d'erreurs global
window.addEventListener('error', function(e) {
    console.error('Erreur globale:', e.error);
    showNotification('Une erreur technique est survenue. Veuillez réessayer.', 'error');
});

// Gestionnaire pour la connexion internet
window.addEventListener('online', function() {
    console.log("Connexion internet rétablie");
});

window.addEventListener('offline', function() {
    showNotification('Vous avez perdu la connexion internet. Certaines fonctionnalités peuvent être limitées.', 'error');
});

// Raccourci clavier Ctrl+Enter pour soumettre
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (form && !isSubmitting) {
            handleSubmit(new Event('submit'));
        }
    }
    
    // Échap pour réinitialiser
    if (e.key === 'Escape') {
        resetErrors();
    }
});

console.log('Script de connexion chargé avec support enseignant/étudiant');