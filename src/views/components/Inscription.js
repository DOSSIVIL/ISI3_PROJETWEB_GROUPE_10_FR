// ==================== CONFIGURATION FIREBASE ====================
const firebaseConfig = {
    apiKey: "AIzaSyAHnlS177olRKu3WJBO-yTQsd4vNI0MIFs",
    authDomain: "achitectureweb-groupe-10.firebaseapp.com",
    projectId: "achitectureweb-groupe-10",
    storageBucket: "achitectureweb-groupe-10.firebasestorage.app",
    messagingSenderId: "646899550480",
    appId: "1:646899550480:web:687fd4f4b2e0ca646efd95"
};

// Variables globales pour Firebase
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseInitialized = false;

// ==================== VARIABLES GLOBALES ====================
let selectedMatieres = [];
let selectedMatieresText = [];

// ==================== FONCTIONS UTILITAIRES ====================
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification animate__animated animate__fadeInRight ${type === 'success' ? 'notification-success' : type === 'error' ? 'notification-error' : 'notification-info'}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                'fa-info-circle';
    
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${icon} text-xl"></i>
            <div class="flex-1">
                <p class="font-bold">${type === 'success' ? 'Succès !' : type === 'error' ? 'Erreur !' : 'Information'}</p>
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
            notification.classList.add('animate__fadeOutRight');
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
}

function resetFormErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.add('hidden');
        el.textContent = '';
    });
    
    document.querySelectorAll('.input-field').forEach(field => {
        field.classList.remove('border-red-500', 'error-shake');
        field.classList.add('border-gray-300');
    });
    
    const successMsg = document.querySelector('.success-message');
    if (successMsg) successMsg.classList.add('hidden');
}

function validateForm() {
    const errors = [];
    
    const requiredFields = [
        { id: 'name', name: 'Nom' },
        { id: 'prenom', name: 'Prénom' },
        { id: 'email', name: 'Email' },
        { id: 'password', name: 'Mot de passe' },
        { id: 'confirmPassword', name: 'Confirmation mot de passe' }
    ];
    
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element && !element.value.trim()) {
            errors.push({
                field: field.id,
                message: `${field.name} est requis`
            });
        }
    });
    
    const sexeSelected = document.querySelector('input[name="sexe"]:checked');
    if (!sexeSelected) {
        errors.push({
            field: 'sexe',
            message: 'Veuillez sélectionner votre sexe'
        });
    }
    
    const diplome = document.getElementById('diplome');
    if (diplome && !diplome.value) {
        errors.push({
            field: 'diplome',
            message: 'Veuillez sélectionner votre diplôme'
        });
    }
    
    const langue = document.getElementById('langue');
    if (langue && !langue.value) {
        errors.push({
            field: 'langue',
            message: 'Veuillez sélectionner une langue'
        });
    }
    
    if (selectedMatieres.length === 0) {
        errors.push({
            field: 'matieres',
            message: 'Veuillez sélectionner au moins une matière'
        });
    }
    
    const email = document.getElementById('email');
    if (email && email.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            errors.push({
                field: 'email',
                message: 'Format d\'email invalide'
            });
        }
    }
    
    const password = document.getElementById('password');
    if (password && password.value.length < 6) {
        errors.push({
            field: 'password',
            message: 'Le mot de passe doit contenir au moins 6 caractères'
        });
    }
    
    const confirmPassword = document.getElementById('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
        errors.push({
            field: 'confirmPassword',
            message: 'Les mots de passe ne correspondent pas'
        });
    }
    
    // Validation pour name et prenom (au moins 2 caractères)
    const name = document.getElementById('name');
    const prenom = document.getElementById('prenom');

    if (name && name.value.trim().length < 2) {
        errors.push({
            field: 'name',
            message: 'Le nom doit contenir au moins 2 caractères'
        });
    }

    if (prenom && prenom.value.trim().length < 2) {
        errors.push({
            field: 'prenom',
            message: 'Le prénom doit contenir au moins 2 caractères'
        });
    }
    
    return errors;
}

function displayFormErrors(errors) {
    errors.forEach(error => {
        if (error.field === 'sexe') {
            const sexeField = document.querySelector('.form-field:has(input[name="sexe"])');
            if (sexeField) {
                const errorElement = sexeField.querySelector('.error-message');
                errorElement.textContent = error.message;
                errorElement.classList.remove('hidden');
            }
        } else if (error.field === 'matieres') {
            const matieresContainer = document.getElementById('selectedMatieresContainer');
            const matiereError = document.querySelector('#matieres').nextElementSibling;
            
            if (matiereError) {
                matiereError.textContent = error.message;
                matiereError.classList.remove('hidden');
            }
            
            if (matieresContainer) {
                matieresContainer.classList.add('error-shake', 'border-red-500');
                setTimeout(() => matieresContainer.classList.remove('error-shake'), 400);
            }
        } else {
            const fieldElement = document.getElementById(error.field);
            if (fieldElement) {
                const errorElement = fieldElement.parentElement.querySelector('.error-message');
                if (errorElement) {
                    errorElement.textContent = error.message;
                    errorElement.classList.remove('hidden');
                }
                fieldElement.classList.add('error-shake', 'border-red-500');
                setTimeout(() => fieldElement.classList.remove('error-shake'), 400);
            }
        }
    });
}

// ==================== GESTION DES MATIÈRES ====================
function updateMatieresDisplay() {
    const container = document.getElementById('selectedMatieresContainer');
    const placeholder = document.getElementById('placeholderText');
    const input = document.getElementById('matieres');
    
    if (!container || !placeholder || !input) return;
    
    placeholder.style.display = selectedMatieres.length > 0 ? 'none' : 'block';
    input.value = selectedMatieres.join(',');
    
    const oldTags = container.querySelectorAll('.matiere-selected');
    oldTags.forEach(tag => tag.remove());
    
    selectedMatieres.forEach((matiere, index) => {
        const tag = document.createElement('div');
        tag.className = 'matiere-selected';
        tag.innerHTML = `
            <span>${selectedMatieresText[index] || matiere}</span>
            <span class="remove-btn" data-matiere="${matiere}">
                <i class="fas fa-times"></i>
            </span>
        `;
        container.appendChild(tag);
        
        tag.querySelector('.remove-btn').addEventListener('click', function() {
            const matiereToRemove = this.getAttribute('data-matiere');
            removeMatiere(matiereToRemove);
        });
    });
}

function addMatiere(matiere) {
    if (!selectedMatieres.includes(matiere)) {
        selectedMatieres.push(matiere);
        const btn = document.querySelector(`[data-matiere="${matiere}"]`);
        if (btn) {
            selectedMatieresText.push(btn.textContent.trim());
            btn.style.display = 'none';
        }
        updateMatieresDisplay();
    }
}

function removeMatiere(matiere) {
    const index = selectedMatieres.indexOf(matiere);
    if (index > -1) {
        selectedMatieres.splice(index, 1);
        selectedMatieresText.splice(index, 1);
        const btn = document.querySelector(`[data-matiere="${matiere}"]`);
        if (btn) {
            btn.style.display = 'inline-flex';
        }
        updateMatieresDisplay();
    }
}

// ==================== GESTION DES MOTS DE PASSE ====================
function setupPasswordHandlers() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (password) {
        password.addEventListener('input', updatePasswordStrength);
    }
    
    if (confirmPassword) {
        confirmPassword.addEventListener('input', checkPasswordMatch);
    }
}

function updatePasswordStrength() {
    const password = document.getElementById('password');
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');
    const strengthScore = document.getElementById('passwordScore');
    
    if (!password || !strengthBar || !strengthText) return;
    
    const value = password.value;
    let strength = 0;
    
    if (value.length >= 8) {
        strength++;
        document.getElementById('reqLength').classList.replace('requirement-not-met', 'requirement-met');
    } else {
        document.getElementById('reqLength').classList.replace('requirement-met', 'requirement-not-met');
    }
    
    if (/[A-Z]/.test(value)) {
        strength++;
        document.getElementById('reqUppercase').classList.replace('requirement-not-met', 'requirement-met');
    } else {
        document.getElementById('reqUppercase').classList.replace('requirement-met', 'requirement-not-met');
    }
    
    if (/[a-z]/.test(value)) {
        strength++;
        document.getElementById('reqLowercase').classList.replace('requirement-not-met', 'requirement-met');
    } else {
        document.getElementById('reqLowercase').classList.replace('requirement-met', 'requirement-not-met');
    }
    
    if (/[0-9]/.test(value)) {
        strength++;
        document.getElementById('reqNumber').classList.replace('requirement-not-met', 'requirement-met');
    } else {
        document.getElementById('reqNumber').classList.replace('requirement-met', 'requirement-not-met');
    }
    
    if (/[!@#$%^&*]/.test(value)) {
        strength++;
        document.getElementById('reqSpecial').classList.replace('requirement-not-met', 'requirement-met');
    } else {
        document.getElementById('reqSpecial').classList.replace('requirement-met', 'requirement-not-met');
    }
    
    const percentage = (strength / 5) * 100;
    strengthBar.style.width = percentage + '%';
    
    strengthBar.className = 'password-strength-bar';
    strengthText.className = '';
    
    if (strength <= 2) {
        strengthBar.classList.add('strength-weak');
        strengthText.classList.add('strength-weak');
        strengthText.textContent = 'Faible';
        if (strengthScore) {
            strengthScore.textContent = strength + '/5';
            strengthScore.className = 'text-xs sm:text-sm font-bold strength-weak';
        }
    } else if (strength <= 4) {
        strengthBar.classList.add('strength-medium');
        strengthText.classList.add('strength-medium');
        strengthText.textContent = 'Moyen';
        if (strengthScore) {
            strengthScore.textContent = strength + '/5';
            strengthScore.className = 'text-xs sm:text-sm font-bold strength-medium';
        }
    } else {
        strengthBar.classList.add('strength-strong');
        strengthText.classList.add('strength-strong');
        strengthText.textContent = 'Fort';
        if (strengthScore) {
            strengthScore.textContent = strength + '/5';
            strengthScore.className = 'text-xs sm:text-sm font-bold strength-strong';
        }
    }
}

function checkPasswordMatch() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const matchMessage = document.getElementById('passwordMatchMessage');
    
    if (!password || !confirmPassword || !matchMessage) return;
    
    if (confirmPassword.value === '') {
        matchMessage.innerHTML = '';
        return;
    }
    
    if (password.value === confirmPassword.value) {
        matchMessage.innerHTML = '<span class="text-green-600 text-xs flex items-center gap-1"><i class="fas fa-check-circle"></i> Les mots de passe correspondent</span>';
    } else {
        matchMessage.innerHTML = '<span class="text-red-500 text-xs flex items-center gap-1"><i class="fas fa-times-circle"></i> Les mots de passe ne correspondent pas</span>';
    }
}

// ==================== TOGGLE VISIBILITÉ MOT DE PASSE ====================
function setupPasswordToggles() {
    document.querySelectorAll('.eye-toggle').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (!input) return;
            
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
}

// ==================== VALIDATION EMAIL ====================
function setupEmailValidation() {
    const email = document.getElementById('email');
    if (!email) return;
    
    email.addEventListener('blur', function() {
        const errorMsg = this.nextElementSibling;
        const successMsg = errorMsg.nextElementSibling;
        
        if (!errorMsg || !successMsg) return;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (emailRegex.test(this.value)) {
            errorMsg.classList.add('hidden');
            successMsg.classList.remove('hidden');
            this.classList.remove('border-red-500');
        } else if (this.value) {
            errorMsg.textContent = 'Veuillez entrer une adresse email valide';
            errorMsg.classList.remove('hidden');
            successMsg.classList.add('hidden');
            this.classList.add('border-red-500', 'error-shake');
            setTimeout(() => this.classList.remove('error-shake'), 400);
        }
    });
}

// Fonction pour nettoyer et valider le display_name
function cleanDisplayName(prenom, name) {
    const displayName = `${prenom || ''} ${name || ''}`.trim();
    
    if (!displayName) {
        const email = document.getElementById('email').value.trim();
        return email.split('@')[0];
    }
    
    return displayName;
}

// ==================== INITIALISATION FIREBASE ====================
async function initFirebase() {
    console.log('Initialisation de Firebase...');
    
    // Attendre que la bibliothèque Firebase soit chargée
    if (typeof firebase === 'undefined') {
        console.log('Bibliothèque Firebase non détectée, chargement...');
        
        // Créer et charger le script Firebase (version compatibilité)
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
        script.async = true;
        
        return new Promise((resolve, reject) => {
            script.onload = async () => {
                console.log('Firebase App chargée');
                
                try {
                    // Charger les services nécessaires
                    const authScript = document.createElement('script');
                    authScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js';
                    authScript.async = true;
                    
                    const firestoreScript = document.createElement('script');
                    firestoreScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';
                    firestoreScript.async = true;
                    
                    await Promise.all([
                        new Promise(res => {
                            authScript.onload = () => {
                                console.log('Firebase Auth chargé');
                                res();
                            };
                            authScript.onerror = reject;
                            document.head.appendChild(authScript);
                        }),
                        new Promise(res => {
                            firestoreScript.onload = () => {
                                console.log('Firebase Firestore chargé');
                                res();
                            };
                            firestoreScript.onerror = reject;
                            document.head.appendChild(firestoreScript);
                        })
                    ]);
                    
                    // Initialiser Firebase
                    firebaseApp = firebase.initializeApp(firebaseConfig);
                    firebaseAuth = firebaseApp;
                    firebaseDb = firebase.firestore();
                    
                    // Configurer la persistance de session
                    if (firebase.auth && firebase.auth().setPersistence) {
                        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
                    }
                    
                    firebaseInitialized = true;
                    console.log('Firebase initialisé avec succès');
                    
                    // Tester la connexion Firestore
                    try {
                        const db = firebase.firestore();
                        const testDoc = await db.collection('enseignants').limit(1).get();
                        console.log('Connexion Firestore testée avec succès');
                    } catch (firestoreError) {
                        console.warn('Test Firestore (peut être normal si collection vide):', firestoreError.message);
                    }
                    
                    resolve();
                } catch (error) {
                    console.error('Erreur lors de l\'initialisation Firebase:', error);
                    reject(error);
                }
            };
            
            script.onerror = (error) => {
                console.error('Erreur de chargement du script Firebase:', error);
                reject(error);
            };
            
            document.head.appendChild(script);
        });
    } else {
        // Firebase est déjà chargé
        try {
            if (!firebase.apps || firebase.apps.length === 0) {
                firebaseApp = firebase.initializeApp(firebaseConfig);
            } else {
                firebaseApp = firebase.app();
            }
            
            firebaseAuth = firebaseApp;
            firebaseDb = firebase.firestore ? firebase.firestore() : null;
            
            // Configurer la persistance si disponible
            if (firebase.auth && firebase.auth().setPersistence) {
                await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
            }
            
            firebaseInitialized = true;
            console.log('Firebase initialisé (déjà chargé)');
            
            return Promise.resolve();
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation Firebase:', error);
            return Promise.reject(error);
        }
    }
}

// ==================== SOUMISSION DU FORMULAIRE ====================
async function handleFormSubmit(e) {
    e.preventDefault();
    
    resetFormErrors();
    
    const errors = validateForm();
    
    if (errors.length > 0) {
        displayFormErrors(errors);
        showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
        return;
    }
    
    if (!firebaseInitialized) {
        showNotification('Erreur: Firebase non initialisé. Vérifiez votre connexion internet.', 'error');
        console.error('Firebase non initialisé');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    
    if (submitBtn && btnText && btnLoader) {
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
    }
    
    try {
        const formData = {
            name: document.getElementById('name').value.trim(),
            prenom: document.getElementById('prenom').value.trim(),
            sexe: document.querySelector('input[name="sexe"]:checked').value,
            diplome: document.getElementById('diplome').value,
            matieres: selectedMatieres,
            matieresText: selectedMatieresText,
            langue: document.getElementById('langue').value,
            email: document.getElementById('email').value.trim()
        };
        
        const password = document.getElementById('password').value;
        
        console.log('Tentative d\'inscription Firebase pour:', formData.email);
        
        const displayName = cleanDisplayName(formData.prenom, formData.name);
        
        if (!displayName) {
            throw new Error('Le nom complet ne peut pas être vide');
        }
        
        // 1. Créer l'utilisateur avec Firebase Auth
        const auth = firebase.auth();
        const userCredential = await auth.createUserWithEmailAndPassword(formData.email, password);
        const user = userCredential.user;
        
        console.log('Utilisateur Firebase créé:', user.uid);
        
        // 2. Mettre à jour le profil
        await user.updateProfile({
            displayName: displayName
        });
        
        // 3. Envoyer l'email de vérification
        await user.sendEmailVerification({
            url: `${window.location.origin}/src/views/templates/Connexion.html?emailVerified=true`,
            handleCodeInApp: true
        });
        
        // 4. Préparer les données pour Firestore
        const enseignantData = {
            uid: user.uid,
            email: formData.email,
            name: formData.name,
            prenom: formData.prenom,
            display_name: displayName,
            sexe: formData.sexe,
            diplome: formData.diplome,
            matieres: formData.matieres,
            matieres_text: formData.matieresText,
            langue: formData.langue,
            role: 'enseignant',
            statut: 'actif',
            email_verified: false,
            
            // CORRECTION : Utiliser FieldValue.serverTimestamp()
            date_inscription: firebase.firestore.FieldValue.serverTimestamp(),
            date_creation: firebase.firestore.FieldValue.serverTimestamp(),
            date_mise_a_jour: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        console.log('Données à envoyer:', enseignantData);
        
        // 5. Insérer dans Firestore
        const db = firebase.firestore();
        await db.collection('enseignants').doc(user.uid).set(enseignantData);
        
        console.log('Insertion Firestore réussie');
        
        showNotification('Inscription réussie ! Un email de vérification a été envoyé. Vérifiez votre boîte mail avant de vous connecter.', 'success');
        
        // Réinitialiser le formulaire
        document.getElementById('tutorRegistrationForm').reset();
        selectedMatieres = [];
        selectedMatieresText = [];
        updateMatieresDisplay();
        
        document.querySelectorAll('.matiere-btn').forEach(btn => {
            btn.style.display = 'inline-flex';
        });
        
        const strengthBar = document.getElementById('passwordStrengthBar');
        const strengthText = document.getElementById('passwordStrengthText');
        const strengthScore = document.getElementById('passwordScore');
        if (strengthBar) strengthBar.style.width = '0%';
        if (strengthText) strengthText.textContent = 'Force du mot de passe';
        if (strengthScore) strengthScore.textContent = '';
        
        document.querySelectorAll('.requirement-icon').forEach(icon => {
            icon.classList.replace('requirement-met', 'requirement-not-met');
        });
        
        const matchMessage = document.getElementById('passwordMatchMessage');
        if (matchMessage) matchMessage.innerHTML = '';
        
        setTimeout(() => {
            window.location.href = '../templates/Connexion.html?newUser=true';
        }, 3000);
        
    } catch (error) {
        console.error("Erreur complète lors de l'inscription Firebase:", error);
        console.error("Code erreur:", error.code);
        console.error("Message:", error.message);
        
        let errorMessage = "Une erreur est survenue lors de l'inscription.";
        
        if (error.code) {
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
                case 'auth/network-request-failed':
                    errorMessage = "Problème de connexion internet. Veuillez réessayer.";
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = "L'inscription par email/mot de passe n'est pas activée dans Firebase.";
                    break;
                case 'permission-denied':
                    errorMessage = "Permission refusée. Vérifiez les règles Firestore ou utilisez des règles temporaires.";
                    break;
                default:
                    errorMessage = "Erreur Firebase: " + error.code;
            }
        } else if (error.message) {
            errorMessage = "Erreur: " + error.message;
        }
        
        showNotification(errorMessage, 'error');
        
        // Déconnecter l'utilisateur en cas d'erreur
        if (firebaseAuth) {
            try {
                await firebase.auth().signOut();
            } catch (signOutError) {
                console.error('Erreur lors de la déconnexion:', signOutError);
            }
        }
        
    } finally {
        if (submitBtn && btnText && btnLoader) {
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    }
}

// ==================== INITIALISATION DE LA PAGE ====================
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Page chargée, initialisation...");
    
    // Configurer les gestionnaires qui ne dépendent pas de Firebase
    setupPasswordHandlers();
    setupPasswordToggles();
    setupEmailValidation();
    
    // Configurer les boutons de matières
    document.querySelectorAll('.matiere-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const matiere = this.getAttribute('data-matiere');
            addMatiere(matiere);
        });
    });
    
    // Configurer le formulaire
    const form = document.getElementById('tutorRegistrationForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Initialiser Firebase
    try {
        await initFirebase();
        console.log("Firebase initialisé avec succès");
        showNotification('Connexion Firebase établie', 'info', 3000);
    } catch (error) {
        console.error("Échec de l'initialisation Firebase:", error);
        showNotification('Erreur de connexion à Firebase. Vérifiez votre internet.', 'error');
        
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i> Base de données indisponible';
            submitBtn.classList.add('bg-red-500', 'cursor-not-allowed');
        }
    }
    
    console.log("Initialisation terminée");
});
