
        // ==================== CONFIGURATION FIREBASE ====================
        const firebaseConfig = {
            apiKey: "AIzaSyAHnlS177olRKu3WJBO-yTQsd4vNI0MIFs",
            authDomain: "achitectureweb-groupe-10.firebaseapp.com",
            projectId: "achitectureweb-groupe-10",
            storageBucket: "achitectureweb-groupe-10.firebasestorage.app",
            messagingSenderId: "646899550480",
            appId: "1:646899550480:web:687fd4f4b2e0ca646efd95"
        };
    
        // ==================== VARIABLES GLOBALES ====================
        let firebaseApp = null;
        let firebaseAuth = null;
        let firebaseDb = null;
        let firebaseInitialized = false;
        let allCountries = [];
        let selectedCountry = null;
        let currentStep = 1;
    
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
    
        // ==================== FONCTIONS UTILITAIRES ====================
        function showNotification(message, type = 'info', duration = 5000) {
            const existingNotifications = document.querySelectorAll('.notification');
            existingNotifications.forEach(notification => notification.remove());
            
            const notification = document.createElement('div');
            notification.className = `notification animate__animated animate__fadeInRight ${type === 'success' ? 'notification-success' : type === 'error' ? 'notification-error' : type === 'warning' ? 'notification-warning' : 'notification-info'}`;
            
            const icon = type === 'success' ? 'fa-check-circle' : 
                        type === 'error' ? 'fa-exclamation-circle' : 
                        type === 'warning' ? 'fa-exclamation-triangle' : 
                        'fa-info-circle';
            
            notification.innerHTML = `
                <div class="flex items-center gap-3">
                    <i class="fas ${icon} text-xl"></i>
                    <div class="flex-1">
                        <p class="font-bold">${type === 'success' ? 'Succès !' : type === 'error' ? 'Erreur !' : type === 'warning' ? 'Attention !' : 'Information'}</p>
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
            }, duration);
        }
    
        function resetFormErrors() {
            document.querySelectorAll('.error-message').forEach(el => {
                el.classList.add('hidden');
                el.textContent = '';
            });
            
            document.querySelectorAll('.input-field').forEach(field => {
                field.classList.remove('border-red-500', 'error-shake');
            });
            
            const successMsg = document.querySelector('.success-message');
            if (successMsg) successMsg.classList.add('hidden');
        }
    
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    
        // ==================== VÉRIFICATION EMAIL ====================
        function validateEmail(email) {
            if (!email) return { valid: false, message: 'Email requis' };
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { valid: false, message: 'Format d\'email invalide' };
            }
            
            const domain = email.split('@')[1].toLowerCase();
            const disposableDomains = [
                'tempmail.com', 'mailinator.com', 'guerrillamail.com', '10minutemail.com', 
                'temp-mail.org', 'yopmail.com', 'throwawaymail.com', 'fakeinbox.com',
                'trashmail.com', 'getairmail.com', 'maildrop.cc', 'spamgourmet.com'
            ];
            
            if (disposableDomains.some(d => domain.includes(d))) {
                return { valid: false, message: 'Les emails temporaires ne sont pas autorisés' };
            }
            
            const commonTLDs = ['.com', '.org', '.net', '.edu', '.gov', '.fr', '.uk', '.de', '.ca', '.be', '.ch', '.sn', '.ci', '.cm', '.ma', '.dz', '.tn', '.ml', '.ne', '.bf', '.bj', '.tg', '.ga', '.cd', '.cg', '.rw', '.bi', '.ke', '.tz', '.ug', '.gh', '.ng', '.eg', '.za'];
            const hasValidTLD = commonTLDs.some(tld => domain.endsWith(tld));
            
            if (!hasValidTLD) {
                return { valid: false, message: 'Domaine d\'email non reconnu' };
            }
            
            return { valid: true, message: 'Format d\'email valide' };
        }
    
        async function handleEmailValidation() {
            const emailField = document.getElementById('email');
            if (!emailField) return;
            
            const email = emailField.value.trim();
            const errorMsg = emailField.parentElement.querySelector('.error-message');
            const successMsg = emailField.parentElement.querySelector('.success-message');
            
            if (!email) {
                if (errorMsg) errorMsg.classList.add('hidden');
                if (successMsg) successMsg.classList.add('hidden');
                emailField.classList.remove('border-green-500', 'border-red-500');
                return;
            }
            
            const validation = validateEmail(email);
            
            if (!validation.valid) {
                if (errorMsg) {
                    errorMsg.textContent = validation.message;
                    errorMsg.classList.remove('hidden');
                }
                if (successMsg) successMsg.classList.add('hidden');
                emailField.classList.remove('border-green-500');
                emailField.classList.add('border-red-500');
            } else {
                if (successMsg) {
                    successMsg.textContent = validation.message;
                    successMsg.classList.remove('hidden');
                }
                if (errorMsg) errorMsg.classList.add('hidden');
                emailField.classList.remove('border-red-500');
                emailField.classList.add('border-green-500');
            }
        }
    
        // ==================== GESTION DES ÉTAPES ====================
        function goToStep(step) {
            const step1 = document.querySelector('[data-step="1"]');
            const step2 = document.querySelector('[data-step="2"]');
            
            if (!step1 || !step2) return;
            
            if (step === 2) {
                const errors = validateStep1();
                if (errors.length > 0) {
                    displayFormErrors(errors);
                    showNotification('Veuillez corriger les erreurs avant de continuer', 'error');
                    return;
                }
                
                currentStep = 2;
                step1.classList.add('hidden');
                step2.classList.remove('hidden');
                updateStepIndicator(1);
            } else if (step === 1) {
                currentStep = 1;
                step2.classList.add('hidden');
                step1.classList.remove('hidden');
                updateStepIndicator(0);
            }
        }
    
        function updateStepIndicator(activeStepIndex) {
            const steps = document.querySelectorAll('.step');
            steps.forEach((step, index) => {
                const stepCircle = step.querySelector('div:first-child');
                const stepText = step.querySelector('span');
                if (index <= activeStepIndex) {
                    stepCircle.classList.remove('bg-gray-300', 'dark:bg-gray-600', 'text-gray-500', 'dark:text-gray-400');
                    stepCircle.classList.add('bg-gradient-to-r', 'from-blue-600', 'to-blue-700', 'text-white');
                    if (stepText) {
                        stepText.classList.remove('text-gray-500', 'dark:text-gray-500');
                        stepText.classList.add('text-gray-700', 'dark:text-gray-300');
                    }
                } else {
                    stepCircle.classList.remove('bg-gradient-to-r', 'from-blue-600', 'to-blue-700', 'text-white');
                    stepCircle.classList.add('bg-gray-300', 'dark:bg-gray-600', 'text-gray-500', 'dark:text-gray-400');
                    if (stepText) {
                        stepText.classList.remove('text-gray-700', 'dark:text-gray-300');
                        stepText.classList.add('text-gray-500', 'dark:text-gray-500');
                    }
                }
            });
        }
    
        // ==================== VALIDATION DES ÉTAPES ====================
        function validateStep1() {
            const errors = [];
            
            // Validation des champs texte
            const nom = document.getElementById('name');
            const prenom = document.getElementById('prenom');
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');
            
            if (!nom || !nom.value.trim()) {
                errors.push({ field: 'name', message: 'Le nom est requis' });
            }
            
            if (!prenom || !prenom.value.trim()) {
                errors.push({ field: 'prenom', message: 'Le prénom est requis' });
            }
            
            if (!email || !email.value.trim()) {
                errors.push({ field: 'email', message: 'L\'email est requis' });
            } else {
                const validation = validateEmail(email.value);
                if (!validation.valid) {
                    errors.push({ field: 'email', message: validation.message });
                }
            }
            
            // Validation du sexe
            const sexeSelected = document.querySelector('input[name="sexe"]:checked');
            if (!sexeSelected) {
                errors.push({ field: 'sexe', message: 'Veuillez sélectionner votre sexe' });
            }
            
            // Validation du mot de passe
            if (!password || !password.value) {
                errors.push({ field: 'password', message: 'Le mot de passe est requis' });
            } else if (password.value.length < 8) {
                errors.push({ field: 'password', message: 'Le mot de passe doit contenir au moins 8 caractères' });
            } else {
                const passwordScore = parseInt(document.getElementById('passwordScore')?.textContent || '0');
                if (passwordScore < 40) {
                    errors.push({ field: 'password', message: 'Le mot de passe est trop faible' });
                }
            }
            
            // Validation de la confirmation
            if (!confirmPassword || !confirmPassword.value) {
                errors.push({ field: 'confirmPassword', message: 'Veuillez confirmer le mot de passe' });
            } else if (password && password.value !== confirmPassword.value) {
                errors.push({ field: 'confirmPassword', message: 'Les mots de passe ne correspondent pas' });
            }
            
            return errors;
        }
    
        function validateStep2() {
            const errors = [];
            
            const langue = document.getElementById('langue');
            const typeEtude = document.getElementById('typeEtude');
            const niveauEtude = document.getElementById('niveauEtude');
            const phone = document.getElementById('phone');
            
            if (!langue || !langue.value) {
                errors.push({ field: 'langue', message: 'La langue est requise' });
            }
            
            if (!typeEtude || !typeEtude.value) {
                errors.push({ field: 'typeEtude', message: 'Le type d\'étude est requis' });
            }
            
            if (!niveauEtude || !niveauEtude.value) {
                errors.push({ field: 'niveauEtude', message: 'Le niveau d\'étude est requis' });
            }
            
            if (!selectedCountry || !selectedCountry.name) {
                errors.push({ field: 'paysInput', message: 'Veuillez sélectionner un pays' });
            }
            
            if (!phone || !phone.value.trim()) {
                errors.push({ field: 'phone', message: 'Le téléphone est requis' });
            } else {
                const phoneNumber = phone.value.replace(/\D/g, '');
                if (phoneNumber.length < 5 || phoneNumber.length > 15) {
                    errors.push({ field: 'phone', message: 'Numéro de téléphone invalide (5-15 chiffres)' });
                }
            }
            
            return errors;
        }
    
        function displayFormErrors(errors) {
            errors.forEach(error => {
                let fieldElement = document.getElementById(error.field);
                let errorElement = null;
                
                if (error.field === 'sexe') {
                    const sexeContainer = document.querySelector('.form-field:has(input[name="sexe"])');
                    if (sexeContainer) {
                        errorElement = sexeContainer.querySelector('.error-message');
                    }
                } else if (fieldElement) {
                    errorElement = fieldElement.parentElement.querySelector('.error-message');
                    if (!errorElement) {
                        errorElement = fieldElement.closest('.form-field')?.querySelector('.error-message');
                    }
                }
                
                if (errorElement) {
                    errorElement.textContent = error.message;
                    errorElement.classList.remove('hidden');
                }
                
                if (fieldElement) {
                    fieldElement.classList.add('error-shake', 'border-red-500');
                    setTimeout(() => fieldElement.classList.remove('error-shake'), 400);
                }
            });
        }
    
        // ==================== GESTION MOTS DE PASSE ====================
        function checkPasswordStrength() {
            const passwordInput = document.getElementById('password');
            if (!passwordInput) return;
            
            const password = passwordInput.value;
            let score = 0;
            
            const hasLength = password.length >= 8;
            const hasUppercase = /[A-Z]/.test(password);
            const hasLowercase = /[a-z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecial = /[!@#$%^&*]/.test(password);
            
            if (hasLength) score += 20;
            if (hasUppercase) score += 20;
            if (hasLowercase) score += 20;
            if (hasNumber) score += 20;
            if (hasSpecial) score += 20;
            
            // Mettre à jour les icônes des exigences
            const requirements = {
                'reqLength': hasLength,
                'reqUppercase': hasUppercase,
                'reqLowercase': hasLowercase,
                'reqNumber': hasNumber,
                'reqSpecial': hasSpecial
            };
            
            Object.keys(requirements).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    if (requirements[id]) {
                        element.classList.remove('requirement-not-met');
                        element.classList.add('requirement-met');
                        element.classList.remove('fa-circle');
                        element.classList.add('fa-check-circle');
                    } else {
                        element.classList.remove('requirement-met');
                        element.classList.add('requirement-not-met');
                        element.classList.remove('fa-check-circle');
                        element.classList.add('fa-circle');
                    }
                }
            });
            
            // Mettre à jour la barre de force
            const passwordStrengthBar = document.getElementById('passwordStrengthBar');
            const passwordStrengthText = document.getElementById('passwordStrengthText');
            const passwordScore = document.getElementById('passwordScore');
            
            if (passwordStrengthBar) {
                passwordStrengthBar.style.width = `${score}%`;
                passwordStrengthBar.className = 'password-strength-bar';
                
                if (score <= 40) {
                    passwordStrengthBar.classList.add('strength-weak');
                    if (passwordStrengthText) {
                        passwordStrengthText.textContent = 'Faible';
                        passwordStrengthText.className = 'password-strength-text strength-weak';
                    }
                } else if (score <= 80) {
                    passwordStrengthBar.classList.add('strength-medium');
                    if (passwordStrengthText) {
                        passwordStrengthText.textContent = 'Moyen';
                        passwordStrengthText.className = 'password-strength-text strength-medium';
                    }
                } else {
                    passwordStrengthBar.classList.add('strength-strong');
                    if (passwordStrengthText) {
                        passwordStrengthText.textContent = 'Fort';
                        passwordStrengthText.className = 'password-strength-text strength-strong';
                    }
                }
            }
            
            if (passwordScore) {
                passwordScore.textContent = `${score}%`;
                passwordScore.className = 'password-score';
                if (score <= 40) {
                    passwordScore.classList.add('strength-weak');
                } else if (score <= 80) {
                    passwordScore.classList.add('strength-medium');
                } else {
                    passwordScore.classList.add('strength-strong');
                }
            }
        }
    
        function checkPasswordMatch() {
            const password = document.getElementById('password')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;
            const passwordMatchMessage = document.getElementById('passwordMatchMessage');
            
            if (!password || !confirmPassword || confirmPassword.length === 0) {
                if (passwordMatchMessage) passwordMatchMessage.innerHTML = '';
                return;
            }
            
            if (password === confirmPassword) {
                if (passwordMatchMessage) {
                    passwordMatchMessage.innerHTML = `
                        <i class="fas fa-check-circle match-success"></i>
                        <span class="match-success">Les mots de passe correspondent</span>
                    `;
                }
                const confirmPasswordField = document.getElementById('confirmPassword');
                if (confirmPasswordField) {
                    confirmPasswordField.classList.remove('border-red-500');
                    confirmPasswordField.classList.add('border-green-500');
                }
            } else {
                if (passwordMatchMessage) {
                    passwordMatchMessage.innerHTML = `
                        <i class="fas fa-times-circle match-error"></i>
                        <span class="match-error">Les mots de passe ne correspondent pas</span>
                    `;
                }
                const confirmPasswordField = document.getElementById('confirmPassword');
                if (confirmPasswordField) {
                    confirmPasswordField.classList.remove('border-green-500');
                    confirmPasswordField.classList.add('border-red-500');
                }
            }
        }
    
        // ==================== GESTION DES PAYS ====================
        async function loadAllCountriesFromAPI() {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);
                
                // Essayer d'abord avec l'API complète
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag,region,subregion', {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    console.warn(`API retourne ${response.status}, utilisation des pays par défaut`);
                    return getFallbackCountries();
                }
                
                const countries = await response.json();
                
                allCountries = countries.map(country => {
                    let phoneCode = '';
                    if (country.idd) {
                        const root = country.idd.root || '';
                        const suffixes = country.idd.suffixes || [];
                        if (suffixes.length > 0) {
                            phoneCode = root + suffixes[0];
                        } else if (root) {
                            phoneCode = root;
                        }
                    }
                    
                    if (phoneCode && phoneCode.startsWith('++')) {
                        phoneCode = '+' + phoneCode.substring(2);
                    }
                    if (phoneCode && !phoneCode.startsWith('+')) {
                        phoneCode = '+' + phoneCode;
                    }
                    
                    return {
                        name: country.name.common,
                        code: country.cca2,
                        flag: country.flag || '🏳️',
                        phone_code: phoneCode || '',
                        region: country.region || '',
                        subregion: country.subregion || ''
                    };
                }).sort((a, b) => a.name.localeCompare(b.name));
                
                console.log(`${allCountries.length} pays chargés depuis l'API`);
                return allCountries;
                
            } catch (error) {
                console.warn('Utilisation des pays par défaut:', error.message);
                return getFallbackCountries();
            }
        }
    
        function getFallbackCountries() {
            console.log('Chargement de la liste complète des pays par défaut');
            return [
                { name: 'Afghanistan', code: 'AF', flag: '🇦🇫', phone_code: '+93', region: 'Asia' },
                { name: 'Afrique du Sud', code: 'ZA', flag: '🇿🇦', phone_code: '+27', region: 'Africa' },
                { name: 'Algérie', code: 'DZ', flag: '🇩🇿', phone_code: '+213', region: 'Africa' },
                { name: 'Allemagne', code: 'DE', flag: '🇩🇪', phone_code: '+49', region: 'Europe' },
                { name: 'Arabie Saoudite', code: 'SA', flag: '🇸🇦', phone_code: '+966', region: 'Asia' },
                { name: 'Argentine', code: 'AR', flag: '🇦🇷', phone_code: '+54', region: 'Americas' },
                { name: 'Australie', code: 'AU', flag: '🇦🇺', phone_code: '+61', region: 'Oceania' },
                { name: 'Belgique', code: 'BE', flag: '🇧🇪', phone_code: '+32', region: 'Europe' },
                { name: 'Bénin', code: 'BJ', flag: '🇧🇯', phone_code: '+229', region: 'Africa' },
                { name: 'Brésil', code: 'BR', flag: '🇧🇷', phone_code: '+55', region: 'Americas' },
                { name: 'Burkina Faso', code: 'BF', flag: '🇧🇫', phone_code: '+226', region: 'Africa' },
                { name: 'Burundi', code: 'BI', flag: '🇧🇮', phone_code: '+257', region: 'Africa' },
                { name: 'Cameroun', code: 'CM', flag: '🇨🇲', phone_code: '+237', region: 'Africa' },
                { name: 'Canada', code: 'CA', flag: '🇨🇦', phone_code: '+1', region: 'Americas' },
                { name: 'Chine', code: 'CN', flag: '🇨🇳', phone_code: '+86', region: 'Asia' },
                { name: 'Congo (RDC)', code: 'CD', flag: '🇨🇩', phone_code: '+243', region: 'Africa' },
                { name: 'Congo', code: 'CG', flag: '🇨🇬', phone_code: '+242', region: 'Africa' },
                { name: 'Côte d\'Ivoire', code: 'CI', flag: '🇨🇮', phone_code: '+225', region: 'Africa' },
                { name: 'Égypte', code: 'EG', flag: '🇪🇬', phone_code: '+20', region: 'Africa' },
                { name: 'Émirats Arabes Unis', code: 'AE', flag: '🇦🇪', phone_code: '+971', region: 'Asia' },
                { name: 'Espagne', code: 'ES', flag: '🇪🇸', phone_code: '+34', region: 'Europe' },
                { name: 'États-Unis', code: 'US', flag: '🇺🇸', phone_code: '+1', region: 'Americas' },
                { name: 'France', code: 'FR', flag: '🇫🇷', phone_code: '+33', region: 'Europe' },
                { name: 'Gabon', code: 'GA', flag: '🇬🇦', phone_code: '+241', region: 'Africa' },
                { name: 'Ghana', code: 'GH', flag: '🇬🇭', phone_code: '+233', region: 'Africa' },
                { name: 'Guinée', code: 'GN', flag: '🇬🇳', phone_code: '+224', region: 'Africa' },
                { name: 'Inde', code: 'IN', flag: '🇮🇳', phone_code: '+91', region: 'Asia' },
                { name: 'Italie', code: 'IT', flag: '🇮🇹', phone_code: '+39', region: 'Europe' },
                { name: 'Japon', code: 'JP', flag: '🇯🇵', phone_code: '+81', region: 'Asia' },
                { name: 'Kenya', code: 'KE', flag: '🇰🇪', phone_code: '+254', region: 'Africa' },
                { name: 'Madagascar', code: 'MG', flag: '🇲🇬', phone_code: '+261', region: 'Africa' },
                { name: 'Mali', code: 'ML', flag: '🇲🇱', phone_code: '+223', region: 'Africa' },
                { name: 'Maroc', code: 'MA', flag: '🇲🇦', phone_code: '+212', region: 'Africa' },
                { name: 'Maurice', code: 'MU', flag: '🇲🇺', phone_code: '+230', region: 'Africa' },
                { name: 'Mauritanie', code: 'MR', flag: '🇲🇷', phone_code: '+222', region: 'Africa' },
                { name: 'Mexique', code: 'MX', flag: '🇲🇽', phone_code: '+52', region: 'Americas' },
                { name: 'Niger', code: 'NE', flag: '🇳🇪', phone_code: '+227', region: 'Africa' },
                { name: 'Nigeria', code: 'NG', flag: '🇳🇬', phone_code: '+234', region: 'Africa' },
                { name: 'Ouganda', code: 'UG', flag: '🇺🇬', phone_code: '+256', region: 'Africa' },
                { name: 'Royaume-Uni', code: 'GB', flag: '🇬🇧', phone_code: '+44', region: 'Europe' },
                { name: 'Rwanda', code: 'RW', flag: '🇷🇼', phone_code: '+250', region: 'Africa' },
                { name: 'Sénégal', code: 'SN', flag: '🇸🇳', phone_code: '+221', region: 'Africa' },
                { name: 'Suisse', code: 'CH', flag: '🇨🇭', phone_code: '+41', region: 'Europe' },
                { name: 'Tanzanie', code: 'TZ', flag: '🇹🇿', phone_code: '+255', region: 'Africa' },
                { name: 'Tchad', code: 'TD', flag: '🇹🇩', phone_code: '+235', region: 'Africa' },
                { name: 'Togo', code: 'TG', flag: '🇹🇬', phone_code: '+228', region: 'Africa' },
                { name: 'Tunisie', code: 'TN', flag: '🇹🇳', phone_code: '+216', region: 'Africa' }
            ].sort((a, b) => a.name.localeCompare(b.name));
        }
    
        function displayCountries(countries, query = '') {
            const resultsContainer = document.getElementById('paysResults');
            const dropdown = document.getElementById('paysDropdown');
            
            if (!resultsContainer || !dropdown) return;
            
            resultsContainer.innerHTML = '';
            
            if (countries.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="px-4 py-3 text-sm text-gray-500">
                        Aucun pays trouvé "${query}"
                    </div>
                `;
                dropdown.classList.remove('hidden');
                return;
            }
            
            const displayCountries = countries.slice(0, 20);
            
            displayCountries.forEach(country => {
                const div = document.createElement('div');
                div.className = 'country-item px-4 py-3 cursor-pointer hover:bg-yellow-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0';
                div.innerHTML = `
                    <span class="text-lg">${country.flag}</span>
                    <div class="flex-1">
                        <div class="font-medium text-gray-800 dark:text-gray-200">${country.name}</div>
                        <div class="flex justify-between items-center mt-1">
                            <span class="text-xs text-gray-500">${country.phone_code || 'N/A'}</span>
                            <span class="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">${country.region || ''}</span>
                        </div>
                    </div>
                `;
                
                div.addEventListener('click', () => selectCountry(country));
                resultsContainer.appendChild(div);
            });
            
            if (countries.length > 20) {
                const moreDiv = document.createElement('div');
                moreDiv.className = 'px-4 py-2 text-sm text-gray-500 text-center border-t border-gray-100 dark:border-gray-700';
                moreDiv.textContent = `... et ${countries.length - 20} autres pays`;
                resultsContainer.appendChild(moreDiv);
            }
            
            dropdown.classList.remove('hidden');
        }
    
        function selectCountry(country) {
            selectedCountry = country;
            
            const paysInput = document.getElementById('paysInput');
            const paysSelected = document.getElementById('paysSelected');
            const countryCode = document.getElementById('countryCode');
            const dropdown = document.getElementById('paysDropdown');
            
            if (paysInput) {
                paysInput.value = `${country.flag} ${country.name}`;
                paysInput.classList.remove('border-red-500');
                const errorElement = paysInput.closest('.form-field')?.querySelector('.error-message');
                if (errorElement) errorElement.classList.add('hidden');
            }
            if (paysSelected) paysSelected.value = country.name;
            if (countryCode) countryCode.value = country.phone_code || '';
            if (dropdown) dropdown.classList.add('hidden');
        }
    
        async function setupCountrySearch() {
            const paysInput = document.getElementById('paysInput');
            const dropdown = document.getElementById('paysDropdown');
            
            if (!paysInput || !dropdown) return;
            
            allCountries = await loadAllCountriesFromAPI();
            
            paysInput.addEventListener('input', function() {
                const query = this.value.toLowerCase().trim();
                
                if (query.length === 0) {
                    displayCountries(allCountries.slice(0, 20));
                    return;
                }
                
                const filteredCountries = allCountries.filter(country => 
                    country.name.toLowerCase().includes(query) || 
                    country.code.toLowerCase().includes(query) ||
                    (country.phone_code && country.phone_code.includes(query))
                );
                
                displayCountries(filteredCountries, query);
            });
            
            paysInput.addEventListener('click', function() {
                if (this.value.trim() === '') {
                    displayCountries(allCountries.slice(0, 20));
                }
            });
            
            document.addEventListener('click', function(event) {
                if (!paysInput.contains(event.target) && !dropdown.contains(event.target)) {
                    dropdown.classList.add('hidden');
                }
            });
        }
    
        // ==================== GESTION DES ÉTUDES ====================
        function setupEducationFields() {
            const typeEtudeSelect = document.getElementById('typeEtude');
            const niveauEtudeSelect = document.getElementById('niveauEtude');
            
            if (!typeEtudeSelect || !niveauEtudeSelect) return;
            
            const niveauxOptions = {
                universitaire: [
                    { value: 'l1', label: 'Licence 1 (L1)' },
                    { value: 'l2', label: 'Licence 2 (L2)' },
                    { value: 'l3', label: 'Licence 3 (L3)' },
                    { value: 'm1', label: 'Master 1 (M1)' },
                    { value: 'm2', label: 'Master 2 (M2)' },
                    { value: 'doctorat', label: 'Doctorat' },
                    {value: 'ingénieur', label:'Cyle ingénieur'}
                ],
                secondaire: [
                    { value: 'seconde', label: 'Seconde' },
                    { value: 'premiere', label: 'Première' },
                    { value: 'terminale', label: 'Terminale' },
                    { value: 'bac', label: 'Baccalauréat' }
                ],
                autre: [
                    { value: 'formation_pro', label: 'Formation professionnelle' },
                    { value: 'autodidacte', label: 'Autodidacte' },
                    { value: 'autre_diplome', label: 'Autre diplôme' }
                ]
            };
    
            typeEtudeSelect.addEventListener('change', function() {
                updateNiveauOptions(this.value, niveauEtudeSelect, niveauxOptions);
            });
            
            updateNiveauOptions(typeEtudeSelect.value, niveauEtudeSelect, niveauxOptions);
        }
    
        function updateNiveauOptions(selectedType, niveauSelect, niveauxOptions) {
            niveauSelect.innerHTML = '<option value="">Sélectionnez un niveau</option>';
            
            if (selectedType && niveauxOptions[selectedType]) {
                niveauxOptions[selectedType].forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option.value;
                    opt.textContent = option.label;
                    niveauSelect.appendChild(opt);
                });
            } else {
                niveauSelect.innerHTML = '<option value="">Sélectionnez d\'abord le type</option>';
            }
        }
    
        // ==================== TOGGLE MOT DE PASSE ====================
        function setupPasswordToggles() {
            document.querySelectorAll('.eye-toggle').forEach(icon => {
                icon.addEventListener('click', function() {
                    const input = this.parentElement.querySelector('input');
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
    
        // ==================== SOUMISSION ====================
        async function handleFormSubmit(e) {
            e.preventDefault();
            
            resetFormErrors();
            
            const errors = validateStep2();
            if (errors.length > 0) {
                displayFormErrors(errors);
                showNotification('Veuillez corriger les erreurs', 'error');
                return;
            }
            
            if (!firebaseInitialized) {
                showNotification('Erreur: Firebase non initialisé', 'error');
                return;
            }
            
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            const btnLoader = document.getElementById('btnLoader');
            
            if (submitBtn) submitBtn.disabled = true;
            if (btnText) btnText.classList.add('hidden');
            if (btnLoader) btnLoader.classList.remove('hidden');
            
            try {
                // Récupération des données du formulaire
                const nameField = document.getElementById('name');
                const prenomField = document.getElementById('prenom');
                const emailField = document.getElementById('email');
                const sexeField = document.querySelector('input[name="sexe"]:checked');
                const langueField = document.getElementById('langue');
                const typeEtudeField = document.getElementById('typeEtude');
                const niveauEtudeField = document.getElementById('niveauEtude');
                const phoneField = document.getElementById('phone');
                const countryCodeField = document.getElementById('countryCode');
                const passwordField = document.getElementById('password');
                
                if (!nameField || !prenomField || !emailField || !sexeField || !langueField || 
                    !typeEtudeField || !niveauEtudeField || !phoneField || !countryCodeField || !passwordField) {
                    throw new Error('Un ou plusieurs champs manquants');
                }
                
                let countryCode = countryCodeField.value.trim();
                if (countryCode.startsWith('++')) {
                    countryCode = '+' + countryCode.substring(2);
                } else if (!countryCode.startsWith('+') && countryCode) {
                    countryCode = '+' + countryCode;
                }
                
                const phoneNumber = phoneField.value.replace(/\D/g, '');
                const cleanCountryCode = countryCode.replace(/\D/g, '');
                const fullPhoneNumber = '+' + cleanCountryCode + phoneNumber;
                
                const formData = {
                    name: nameField.value.trim(),
                    prenom: prenomField.value.trim(),
                    sexe: sexeField.value,
                    langue: langueField.value,
                    email: emailField.value.trim(),
                    typeEtude: typeEtudeField.value,
                    niveauEtude: niveauEtudeField.value,
                    pays: selectedCountry?.name || '',
                    paysCode: selectedCountry?.code || '',
                    phone: fullPhoneNumber,
                    password: passwordField.value
                };
                
                console.log("Tentative inscription Firebase étudiant:", formData.email);
                
                // 1. Créer l'utilisateur dans Firebase Auth
                const auth = firebase.auth();
                const userCredential = await auth.createUserWithEmailAndPassword(formData.email, formData.password);
                const user = userCredential.user;
                
                if (!user) throw new Error('Échec création compte Firebase');
                
                console.log("Utilisateur Firebase créé:", user.uid);
                
                // 2. Mettre à jour le profil
                await user.updateProfile({
                    displayName: `${formData.prenom} ${formData.name}`,
                    photoURL: 'https://firebasestorage.googleapis.com/v0/b/achitectureweb-groupe-10.appspot.com/o/default-avatar.png?alt=media'
                });
                
                // 3. Envoyer l'email de vérification
                await user.sendEmailVerification({
                    url: `${window.location.origin}/src/views/templates/Connexion.html?emailVerified=true`,
                    handleCodeInApp: true
                });
                
                // 4. Insérer dans la collection etudiants de Firestore avec les nouveaux champs
                const studentData = {
                    uid: user.uid,
                    email: formData.email,
                    name: formData.name,
                    prenom: formData.prenom,
                    nom_complet: `${formData.prenom} ${formData.name}`,
                    display_name: `${formData.prenom} ${formData.name}`,
                    sexe: formData.sexe,
                    langue: formData.langue,
                    type_etude: formData.typeEtude,
                    niveau_etude: formData.niveauEtude,
                    pays: formData.pays,
                    pays_code: formData.paysCode,
                    phone: formData.phone,
                    role: 'etudiant',
                    statut: 'actif',
                    email_verified: false,
                    
                    // Nouveaux champs ajoutés
                    statistiques: {
                        coursSuivis: 0,
                        examensPasses: 0,
                        heuresEtude: 0,
                        moyenneGenerale: 0,
                        progression: 0,
                        derniereConnexion: null,
                        badges: [],
                        niveau: 1
                    },
                    coursSuivis: 0,
                    examensPasses: 0,
                    heuresEtude: 0,
                    photo_url: 'https://firebasestorage.googleapis.com/v0/b/achitectureweb-groupe-10.appspot.com/o/default-avatar.png?alt=media',
                    bio: '',
                    preferences: {
                        notifications_email: true,
                        notifications_push: true,
                        theme: 'light',
                        langue_interface: formData.langue
                    },
                    reseau_social: {
                        linkedin: '',
                        twitter: '',
                        github: ''
                    },
                    competences: [],
                    interets: [],
                    date_naissance: null,
                    adresse: {
                        rue: '',
                        ville: '',
                        code_postal: '',
                        pays: formData.pays
                    },
                    
                    // Timestamps - CORRECTION IMPORTANTE : utiliser Timestamp.now()
                    date_inscription: firebase.firestore.Timestamp.now(),
                    date_creation: firebase.firestore.Timestamp.now(),
                    date_mise_a_jour: firebase.firestore.Timestamp.now()
                };
                
                // CORRECTION : Utiliser la méthode correcte pour Firestore
                await firebaseDb.collection('etudiants').doc(user.uid).set(studentData);
                
                console.log("Données insérées dans Firestore avec les nouveaux champs");
                
                // Succès
                showNotification('Inscription réussie ! Un email de vérification a été envoyé. Vérifiez votre boîte mail.', 'success');
                
                // Réinitialiser le formulaire
                resetForm();
                
                // Rediriger après 3 secondes
                setTimeout(() => {
                    window.location.href = '../templates/Connexion.html?newStudent=true';
                }, 3000);
                
            } catch (error) {
                console.error("Erreur inscription Firebase:", error);
                
                let errorMessage = "Erreur lors de l'inscription";
                
                if (error.code) {
                    switch(error.code) {
                        case 'auth/email-already-in-use':
                            errorMessage = "Un compte existe déjà avec cet email";
                            break;
                        case 'auth/invalid-email':
                            errorMessage = "Email invalide";
                            break;
                        case 'auth/weak-password':
                            errorMessage = "Mot de passe trop faible (min 8 caractères)";
                            break;
                        case 'auth/network-request-failed':
                            errorMessage = "Problème de connexion internet";
                            break;
                        case 'auth/operation-not-allowed':
                            errorMessage = "L'inscription par email/mot de passe n'est pas activée";
                            break;
                        case 'permission-denied':
                            errorMessage = "Permission refusée. Vérifiez les règles Firestore.";
                            break;
                        default:
                            errorMessage = `Erreur Firebase: ${error.code}`;
                    }
                } else if (error.message) {
                    errorMessage = `Erreur: ${error.message}`;
                }
                
                showNotification(errorMessage, 'error', 8000);
                
                // Déconnecter l'utilisateur en cas d'erreur
                if (firebaseAuth && firebase.auth) {
                    try {
                        await firebase.auth().signOut();
                    } catch (signOutError) {
                        console.error('Erreur lors de la déconnexion:', signOutError);
                    }
                }
                
            } finally {
                if (submitBtn) submitBtn.disabled = false;
                if (btnText) btnText.classList.remove('hidden');
                if (btnLoader) btnLoader.classList.add('hidden');
            }
        }
    
        // ==================== RESET FORM ====================
        function resetForm() {
            document.querySelectorAll('form').forEach(form => form.reset());
            
            selectedCountry = null;
            
            const paysInput = document.getElementById('paysInput');
            const countryCode = document.getElementById('countryCode');
            
            if (paysInput) paysInput.value = '';
            if (countryCode) countryCode.value = '';
            
            const strengthBar = document.getElementById('passwordStrengthBar');
            const strengthText = document.getElementById('passwordStrengthText');
            const strengthScore = document.getElementById('passwordScore');
            
            if (strengthBar) {
                strengthBar.style.width = '0%';
                strengthBar.className = 'password-strength-bar';
            }
            if (strengthText) {
                strengthText.textContent = 'Force du mot de passe';
                strengthText.className = 'password-strength-text';
            }
            if (strengthScore) strengthScore.textContent = '';
            
            const requirements = ['reqLength', 'reqUppercase', 'reqLowercase', 'reqNumber', 'reqSpecial'];
            requirements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.classList.remove('requirement-met', 'fa-check-circle');
                    element.classList.add('requirement-not-met', 'fa-circle');
                }
            });
            
            const matchMessage = document.getElementById('passwordMatchMessage');
            if (matchMessage) matchMessage.innerHTML = '';
            
            goToStep(1);
        }
    
        // ==================== INITIALISATION ====================
        document.addEventListener('DOMContentLoaded', async function() {
            console.log("Initialisation page inscription étudiant Firebase");
            
            // Configurer les boutons d'étape
            const nextBtn = document.getElementById('nextBtn');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => goToStep(2));
            }
            
            const backBtn = document.getElementById('backBtn');
            if (backBtn) {
                backBtn.addEventListener('click', () => goToStep(1));
            }
            
            // Configurer le formulaire de soumission
            const formStep2 = document.getElementById('registrationFormStep2');
            if (formStep2) {
                formStep2.addEventListener('submit', handleFormSubmit);
            }
            
            // Configurer les gestionnaires de mot de passe
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.addEventListener('input', checkPasswordStrength);
            }
            
            const confirmPasswordInput = document.getElementById('confirmPassword');
            if (confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', checkPasswordMatch);
            }
            
            // Configurer la validation d'email
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.addEventListener('blur', handleEmailValidation);
                emailInput.addEventListener('input', debounce(handleEmailValidation, 1000));
            }
            
            // Configurer les autres fonctionnalités
            setupCountrySearch();
            setupEducationFields();
            setupPasswordToggles();
            
            // Initialiser Firebase
            try {
                await initFirebase();
                console.log("Firebase initialisé avec succès");
            } catch (error) {
                console.error("Échec de l'initialisation Firebase:", error);
                showNotification("Problème de connexion à la base de données", "warning");
                
                const submitBtn = document.getElementById('submitBtn');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i> Base de données indisponible';
                    submitBtn.classList.add('bg-red-500', 'cursor-not-allowed');
                }
            }
            
            console.log("Initialisation terminée");
        });