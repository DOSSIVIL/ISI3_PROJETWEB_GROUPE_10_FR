// Configuration API
const API_TOKEN = '2ad1ffe2de6acb841251b8f5694ec531e074f130';
const API_BASE_URL = 'https://aaapis.com/api/v1';

// Liste des pays africains (stockée en mémoire pour performances)
let africanCountries = [];

// Éléments DOM
const form = document.getElementById('registrationForm');
const paysInput = document.getElementById('paysInput');
const paysSelected = document.getElementById('paysSelected');
const paysDropdown = document.getElementById('paysDropdown');
const paysResults = document.getElementById('paysResults');
const countryCode = document.getElementById('countryCode');
const emailInput = document.getElementById('email');
const telephoneInput = document.getElementById('telephone');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');

// Charger les pays africains au chargement de la page
window.addEventListener('DOMContentLoaded', async () => {
    await loadAfricanCountries();
});

// Fonction pour charger les pays africains via l'API RestCountries
async function loadAfricanCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/region/africa', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Formater les données pour correspondre à notre structure
            africanCountries = data.map(country => ({
                name: country.translations.fra?.common || country.name.common,
                code: country.cca2,
                flag: country.flag,
                phone_code: country.idd.root + (country.idd.suffixes?.[0] || '')
            })).sort((a, b) => a.name.localeCompare(b.name));
        } else {
            // Liste de secours des principaux pays africains
            africanCountries = getFallbackAfricanCountries();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des pays:', error);
        africanCountries = getFallbackAfricanCountries();
    }
}

// Vérifier si un pays est africain (liste de secours)
function isAfricanCountry(countryName) {
    const africanCountryNames = [
        'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi',
        'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros',
        'Congo', 'Democratic Republic of the Congo', 'Djibouti', 'Egypt',
        'Equatorial Guinea', 'Eritrea', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana',
        'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia',
        'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius',
        'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda',
        'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone',
        'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Swaziland',
        'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
    ];
    return africanCountryNames.some(name => 
        countryName.toLowerCase().includes(name.toLowerCase())
    );
}

// Liste de secours des pays africains avec indicatifs
function getFallbackAfricanCountries() {
    return [
        { name: 'Cameroun', code: 'CM', flag: '🇨🇲', phone_code: '+237' },
        { name: 'Sénégal', code: 'SN', flag: '🇸🇳', phone_code: '+221' },
        { name: 'Côte d\'Ivoire', code: 'CI', flag: '🇨🇮', phone_code: '+225' },
        { name: 'Nigeria', code: 'NG', flag: '🇳🇬', phone_code: '+234' },
        { name: 'Ghana', code: 'GH', flag: '🇬🇭', phone_code: '+233' },
        { name: 'Kenya', code: 'KE', flag: '🇰🇪', phone_code: '+254' },
        { name: 'Afrique du Sud', code: 'ZA', flag: '🇿🇦', phone_code: '+27' },
        { name: 'Égypte', code: 'EG', flag: '🇪🇬', phone_code: '+20' },
        { name: 'Maroc', code: 'MA', flag: '🇲🇦', phone_code: '+212' },
        { name: 'Tunisie', code: 'TN', flag: '🇹🇳', phone_code: '+216' },
        { name: 'Algérie', code: 'DZ', flag: '🇩🇿', phone_code: '+213' },
        { name: 'Éthiopie', code: 'ET', flag: '🇪🇹', phone_code: '+251' },
        { name: 'Tanzanie', code: 'TZ', flag: '🇹🇿', phone_code: '+255' },
        { name: 'Ouganda', code: 'UG', flag: '🇺🇬', phone_code: '+256' },
        { name: 'Mali', code: 'ML', flag: '🇲🇱', phone_code: '+223' },
        { name: 'Burkina Faso', code: 'BF', flag: '🇧🇫', phone_code: '+226' },
        { name: 'Niger', code: 'NE', flag: '🇳🇪', phone_code: '+227' },
        { name: 'Tchad', code: 'TD', flag: '🇹🇩', phone_code: '+235' },
        { name: 'Gabon', code: 'GA', flag: '🇬🇦', phone_code: '+241' },
        { name: 'Congo', code: 'CG', flag: '🇨🇬', phone_code: '+242' },
        { name: 'RD Congo', code: 'CD', flag: '🇨🇩', phone_code: '+243' },
        { name: 'Benin', code: 'BJ', flag: '🇧🇯', phone_code: '+229' },
        { name: 'Togo', code: 'TG', flag: '🇹🇬', phone_code: '+228' },
        { name: 'Rwanda', code: 'RW', flag: '🇷🇼', phone_code: '+250' }
    ];
}

// Recherche de pays
paysInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm.length === 0) {
        paysDropdown.classList.add('hidden');
        paysSelected.value = '';
        countryCode.value = '';
        return;
    }

    const filteredCountries = africanCountries.filter(country => 
        country.name.toLowerCase().includes(searchTerm)
    );

    if (filteredCountries.length > 0) {
        displayCountryResults(filteredCountries);
        paysDropdown.classList.remove('hidden');
    } else {
        paysDropdown.classList.add('hidden');
    }
});

// Afficher les résultats de pays
function displayCountryResults(countries) {
    paysResults.innerHTML = '';
    
    countries.forEach(country => {
        const countryItem = document.createElement('div');
        countryItem.className = 'country-item px-4 py-3 cursor-pointer flex items-center gap-3 hover:bg-blue-50 transition';
        
        const flag = country.flag || country.emoji || '🏳️';
        const phoneCode = country.phone_code || country.calling_code || '';
        
        countryItem.innerHTML = `
            <span class="text-2xl">${flag}</span>
            <div class="flex-1">
                <div class="font-medium text-gray-800">${country.name}</div>
                ${phoneCode ? `<div class="text-sm text-gray-500">${phoneCode}</div>` : ''}
            </div>
        `;
        
        countryItem.addEventListener('click', () => {
            selectCountry(country);
        });
        
        paysResults.appendChild(countryItem);
    });
}

// Sélectionner un pays
function selectCountry(country) {
    const flag = country.flag || country.emoji || '🏳️';
    const phoneCode = country.phone_code || country.calling_code || '';
    
    paysInput.value = `${flag} ${country.name}`;
    paysSelected.value = country.name;
    countryCode.value = phoneCode;
    paysDropdown.classList.add('hidden');
    
    // Effacer le message d'erreur
    const errorMsg = paysInput.parentElement.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.classList.add('hidden');
        paysInput.classList.remove('border-red-500');
    }
}

// Fermer le dropdown si on clique ailleurs
document.addEventListener('click', (e) => {
    if (!paysInput.contains(e.target) && !paysDropdown.contains(e.target)) {
        paysDropdown.classList.add('hidden');
    }
});

// Validation de l'email avec l'API
let emailValidationTimeout;
let isEmailValidating = false;

emailInput.addEventListener('input', (e) => {
    clearTimeout(emailValidationTimeout);
    
    const email = e.target.value.trim();
    const errorMsg = emailInput.parentElement.parentElement.querySelector('.error-message');
    const successMsg = emailInput.parentElement.parentElement.querySelector('.success-message');
    const loadingIcon = emailInput.parentElement.querySelector('.fa-at');
    
    // Cacher les messages
    errorMsg.classList.add('hidden');
    successMsg.classList.add('hidden');
    emailInput.classList.remove('border-red-500', 'border-green-500');
    
    // Réinitialiser l'icône
    if (loadingIcon) {
        loadingIcon.className = 'fas fa-at absolute right-4 top-4 text-gray-400';
    }
    
    if (email.length === 0) return;
    
    // Validation basique du format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorMsg.textContent = '❌ Format d\'email invalide';
        errorMsg.classList.remove('hidden');
        emailInput.classList.add('border-red-500');
        if (loadingIcon) {
            loadingIcon.className = 'fas fa-times-circle absolute right-4 top-4 text-red-500';
        }
        return;
    }
    
    // Afficher l'icône de chargement
    if (loadingIcon) {
        loadingIcon.className = 'fas fa-spinner fa-spin absolute right-4 top-4 text-yellow-500';
    }
    
    // Attendre 1 seconde après la dernière frappe
    emailValidationTimeout = setTimeout(() => {
        validateEmailWithAPI(email);
    }, 1000);
});

// Valider l'email avec l'API
async function validateEmailWithAPI(email) {
    const errorMsg = emailInput.parentElement.parentElement.querySelector('.error-message');
    const successMsg = emailInput.parentElement.parentElement.querySelector('.success-message');
    const loadingIcon = emailInput.parentElement.querySelector('.fa-spinner');
    
    isEmailValidating = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/validate/email/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        
        if (data.valid) {
            // Email valide
            successMsg.classList.remove('hidden');
            successMsg.classList.add('success-pulse');
            emailInput.classList.add('border-green-500');
            emailInput.classList.remove('border-red-500');
            
            // Changer l'icône en succès
            if (loadingIcon) {
                loadingIcon.className = 'fas fa-check-circle absolute right-4 top-4 text-green-500';
            }
        } else {
            // Email invalide
            errorMsg.textContent = '❌ Cet email n\'est pas valide';
            errorMsg.classList.remove('hidden');
            emailInput.classList.add('border-red-500');
            emailInput.classList.remove('border-green-500');
            
            // Changer l'icône en erreur
            if (loadingIcon) {
                loadingIcon.className = 'fas fa-times-circle absolute right-4 top-4 text-red-500';
            }
        }
    } catch (error) {
        console.error('Erreur validation email:', error);
        // En cas d'erreur API, afficher un message d'avertissement
        errorMsg.textContent = '⚠️ Impossible de vérifier l\'email (erreur réseau)';
        errorMsg.classList.remove('hidden');
        emailInput.classList.add('border-yellow-500');
        
        if (loadingIcon) {
            loadingIcon.className = 'fas fa-exclamation-triangle absolute right-4 top-4 text-yellow-500';
        }
    } finally {
        isEmailValidating = false;
    }
}

// Validation du téléphone
telephoneInput.addEventListener('input', (e) => {
    const phone = e.target.value.replace(/\D/g, '');
    e.target.value = phone;
    
    const errorMsg = telephoneInput.parentElement.querySelector('.error-message');
    
    if (phone.length > 0 && phone.length < 8) {
        errorMsg.textContent = 'Le numéro doit contenir au moins 8 chiffres';
        errorMsg.classList.remove('hidden');
        telephoneInput.classList.add('border-red-500');
    } else {
        errorMsg.classList.add('hidden');
        telephoneInput.classList.remove('border-red-500');
    }
});

// Validation du formulaire
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Réinitialiser les messages d'erreur
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.add('hidden');
    });
    document.querySelectorAll('input, select').forEach(input => {
        input.classList.remove('border-red-500', 'error-shake');
    });
    
    let isValid = true;
    const errors = [];
    
    // Validation Nom
    const nom = document.getElementById('nom').value.trim();
    if (nom.length < 2) {
        showError('nom', 'Le nom doit contenir au moins 2 caractères');
        isValid = false;
    }
    
    // Validation Prénom
    const prenom = document.getElementById('prenom').value.trim();
    if (prenom.length < 2) {
        showError('prenom', 'Le prénom doit contenir au moins 2 caractères');
        isValid = false;
    }
    
    // Validation Sexe
    const sexe = document.querySelector('input[name="sexe"]:checked');
    if (!sexe) {
        const sexeContainer = document.querySelector('input[name="sexe"]').closest('div').parentElement;
        const errorMsg = sexeContainer.querySelector('.error-message');
        errorMsg.textContent = 'Veuillez sélectionner votre sexe';
        errorMsg.classList.remove('hidden');
        isValid = false;
    }
    
    // Validation Email
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('email', '❌ Email invalide');
        isValid = false;
    } else if (!emailInput.classList.contains('border-green-500')) {
        // Vérifier si l'email a été validé par l'API
        const errorMsgEmail = emailInput.parentElement.parentElement.querySelector('.error-message');
        errorMsgEmail.textContent = '⚠️ Veuillez attendre la validation de l\'email';
        errorMsgEmail.classList.remove('hidden');
        emailInput.classList.add('border-yellow-500');
        isValid = false;
    }
    
    // Validation Langue
    const langue = document.getElementById('langue').value;
    if (!langue) {
        showError('langue', 'Veuillez sélectionner une langue');
        isValid = false;
    }
    
    // Validation Pays
    if (!paysSelected.value) {
        const errorMsg = paysInput.parentElement.querySelector('.error-message');
        errorMsg.textContent = 'Veuillez sélectionner un pays';
        errorMsg.classList.remove('hidden');
        paysInput.classList.add('border-red-500', 'error-shake');
        isValid = false;
    }
    
    // Validation Téléphone
    const telephone = telephoneInput.value.replace(/\D/g, '');
    if (telephone.length < 8) {
        showError('telephone', 'Le numéro doit contenir au moins 8 chiffres');
        isValid = false;
    }
    
    if (!countryCode.value) {
        showError('telephone', 'Veuillez sélectionner un pays d\'abord');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Afficher le loader
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    submitBtn.disabled = true;
    
    // Simuler l'envoi (remplacer par votre logique d'envoi)
    setTimeout(() => {
        const formData = {
            nom: nom,
            prenom: prenom,
            sexe: sexe.value,
            email: email,
            langue: langue,
            pays: paysSelected.value,
            telephone: countryCode.value + telephone
        };
        
        console.log('Données du formulaire:', formData);
        
        // Afficher un message de succès
        alert('Inscription réussie ! Bienvenue sur EduConnect Africa.');
        
        // Réinitialiser le formulaire
        form.reset();
        paysInput.value = '';
        paysSelected.value = '';
        countryCode.value = '';
        
        // Masquer le loader
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        submitBtn.disabled = false;
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
    
    // Retirer l'animation après 300ms
    setTimeout(() => {
        field.classList.remove('error-shake');
    }, 300);
}

