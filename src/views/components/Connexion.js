        // Éléments DOM
        const form = document.getElementById('loginForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitBtn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const btnLoader = document.getElementById('btnLoader');
        const eyeToggle = document.querySelector('.eye-toggle');

        // Gestion de l'affichage/masquage du mot de passe
        eyeToggle.addEventListener('click', function() {
            const isPassword = passwordInput.type === 'password';
            
            passwordInput.type = isPassword ? 'text' : 'password';
            this.className = isPassword 
                ? 'fas fa-eye-slash eye-toggle absolute right-4 top-4 text-yellow-500' 
                : 'fas fa-eye eye-toggle absolute right-4 top-4 text-gray-400';
        });

        // Validation du formulaire
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Réinitialiser les messages d'erreur
            document.querySelectorAll('.error-message').forEach(msg => {
                msg.classList.add('hidden');
            });
            document.querySelectorAll('input').forEach(input => {
                input.classList.remove('border-red-500', 'error-shake');
            });
            
            let isValid = true;
            
            // Validation Email
            const email = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('email', '❌ Adresse email invalide');
                isValid = false;
            }
            
            // Validation Mot de passe
            const password = passwordInput.value;
            if (password.length < 6) {
                showError('password', '❌ Le mot de passe doit contenir au moins 6 caractères');
                isValid = false;
            }
            
            if (!isValid) {
                return;
            }
            
            // Afficher le loader
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
            submitBtn.disabled = true;
            
            // Simuler la connexion (remplacer par votre logique de connexion)
            setTimeout(() => {
                const loginData = {
                    email: email,
                    password: password
                };
                
                console.log('Données de connexion:', loginData);
                
                // Afficher un message de succès
                alert('Connexion réussie ! Bienvenue sur EduConnect Africa.');
                
                // Réinitialiser le formulaire
                form.reset();
                
                // Masquer le loader
                btnText.classList.remove('hidden');
                btnLoader.classList.add('hidden');
                submitBtn.disabled = false;
                
                // Rediriger vers le dashboard (à implémenter)
                // window.location.href = '/dashboard';
            }, 2000);
        });

        // Fonction pour afficher les erreurs
        function showError(fieldId, message) {
            const field = document.getElementById(fieldId);
            const errorMsg = field.parentElement.querySelector('.error-message');
            
            if (errorMsg) {
                errorMsg.textContent = message;
                errorMsg.classList.remove('hidden');
            }
            
            field.classList.add('border-red-500', 'error-shake');
            
            // Retirer l'animation après 400ms
            setTimeout(() => {
                field.classList.remove('error-shake');
            }, 400);
        }

        // Animation au chargement
        window.addEventListener('DOMContentLoaded', () => {
            // Ajouter une classe pour déclencher les animations
            document.querySelector('.login-card').style.opacity = '0';
            setTimeout(() => {
                document.querySelector('.login-card').style.opacity = '1';
            }, 100);
        });