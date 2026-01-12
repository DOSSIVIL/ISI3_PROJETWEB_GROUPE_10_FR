// scripts/tutor-list.js
// Gestionnaire de la liste des tuteurs

class TutorListManager {
    constructor() {
        this.tutors = [];
        this.filteredTutors = [];
        this.currentFilter = 'all';
        this.currentSort = 'rating';
        this.searchQuery = '';
        
        // NE PAS initialiser FirebaseManager ici
        // Il sera créé dans init() après vérification
        
        this.init();
    }

    async init() {
        try {
            // Charger les données
            await this.loadTutors();
            
            // Initialiser l'interface
            this.renderTutors();
            this.setupEventListeners();
            this.updateStatistics();
            
            // Afficher un message de bienvenue
            setTimeout(() => {
                if (typeof showNotification === 'function') {
                    showNotification('Liste des tuteurs chargée', `${this.tutors.length} tuteurs disponibles`, 'success');
                }
            }, 1000);
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            this.showError('Impossible de charger les tuteurs');
        }
    }

    
    async loadTutors() {
        try {
            // ESSAYER D'ABORD FIREBASE si disponible
            if (typeof FirebaseManager !== 'undefined') {
                console.log('Tentative de chargement depuis Firebase...');
                try {
                    const firebaseManager = new FirebaseManager();
                    // Attendre que Firebase soit initialisé
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const firebaseTutors = await firebaseManager.getTutors({
                        available: true
                    });
                    
                    if (firebaseTutors && firebaseTutors.length > 0) {
                        this.tutors = firebaseTutors;
                        console.log(`${this.tutors.length} tuteurs chargés depuis Firebase`);
                        this.filteredTutors = [...this.tutors];
                        return this.tutors;
                    }
                } catch (firebaseError) {
                    console.warn('Firebase non disponible:', firebaseError);
                }
            }
            
            // SINON, utiliser MockData
            console.log('Utilisation des données de démonstration...');
            if (typeof MockData !== 'undefined' && MockData.tutors) {
                this.tutors = MockData.tutors;
            } else {
                this.tutors = this.getDefaultTutors();
            }
            
            this.filteredTutors = [...this.tutors];
            
            // Simulation de chargement asynchrone
            return new Promise(resolve => {
                setTimeout(() => {
                    console.log(`${this.tutors.length} tuteurs chargés (démo)`);
                    resolve(this.tutors);
                }, 500);
            });
            
        } catch (error) {
            console.error('Erreur de chargement des données:', error);
            this.tutors = this.getDefaultTutors();
            this.filteredTutors = [...this.tutors];
            return this.tutors;
        }
    }

    getDefaultTutors() {
        return [
            {
                id: 1,
                name: "Dr. Domisseck",
                subject: "physics",
                subjectName: "Physique",
                rating: 4.9,
                totalSessions: 128,
                pricePerHour: 2500,
                available: true,
                online: true,
                description: "Spécialiste en physique quantique avec 10 ans d'expérience.",
                languages: ["Français", "Anglais"],
                education: "PhD en Physique - Université de Paris",
                experience: "10 ans",
                avatar: "DD",
                reviews: 47,
                specialties: ["Mécanique quantique", "Radioactivité", "Physique nucléaire"]
            },
            {
                id: 2,
                name: "Prof. Michel",
                subject: "math",
                subjectName: "Mathématiques",
                rating: 4.7,
                totalSessions: 95,
                pricePerHour: 2000,
                available: true,
                online: false,
                description: "Expert en algèbre et calcul différentiel.",
                languages: ["Français"],
                education: "Master en Mathématiques - ENS",
                experience: "8 ans",
                avatar: "PM",
                reviews: 32,
                specialties: ["Algèbre linéaire", "Calcul différentiel", "Statistiques"]
            },
            {
                id: 3,
                name: "Dr. Edouard",
                subject: "info",
                subjectName: "Informatique",
                rating: 5.0,
                totalSessions: 210,
                pricePerHour: 3000,
                available: true,
                online: true,
                description: "Expert en algorithmes et développement web.",
                languages: ["Anglais", "Français"],
                education: "Computer Science - MIT",
                experience: "12 ans",
                avatar: "DE",
                reviews: 89,
                specialties: ["Algorithmes", "Développement Web", "IA"]
            },
            {
                id: 4,
                name: "Prof. Med",
                subject: "literature",
                subjectName: "Littérature",
                rating: 4.8,
                totalSessions: 75,
                pricePerHour: 1800,
                available: false,
                online: true,
                description: "Spécialiste en littérature africaine.",
                languages: ["Français", "Anglais"],
                education: "PhD en Littérature",
                experience: "15 ans",
                avatar: "PM",
                reviews: 28,
                specialties: ["Littérature africaine", "Analyse textuelle"]
            },
            {
                id: 5,
                name: "Dr. Wangari",
                subject: "science",
                subjectName: "Sciences",
                rating: 4.6,
                totalSessions: 62,
                pricePerHour: 2200,
                available: true,
                online: false,
                description: "Environnementaliste et biologiste.",
                languages: ["Français", "Anglais"],
                education: "PhD en Sciences Environnementales",
                experience: "20 ans",
                avatar: "DW",
                reviews: 19,
                specialties: ["Écologie", "Biologie", "Développement durable"]
            },
            {
                id: 6,
                name: "Prof. Einstein",
                subject: "physics",
                subjectName: "Physique",
                rating: 4.9,
                totalSessions: 300,
                pricePerHour: 3500,
                available: true,
                online: true,
                description: "Spécialiste en physique théorique.",
                languages: ["Allemand", "Anglais", "Français"],
                education: "PhD en Physique - ETH Zurich",
                experience: "30 ans",
                avatar: "PE",
                reviews: 156,
                specialties: ["Relativité", "Physique théorique", "Cosmologie"]
            }
        ];
    }

    setupEventListeners() {
        // Filtres par matière
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const subject = e.currentTarget.dataset.subject;
                this.applyFilter(subject);
                
                // Mettre à jour l'état actif
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
            });
        });

        // Recherche
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchQuery = e.target.value;
                    this.applySearch();
                }, 300);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applySearch();
                }
            });
        }

        // Recherche avec bouton
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.applySearch());
        }

        // Tri
        const sortSelect = document.getElementById('sort-options');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applySort();
            });
        }

        // Réinitialisation
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }

    applyFilter(subject) {
        this.currentFilter = subject;
        
        // Appliquer le filtre
        if (subject === 'all') {
            this.filteredTutors = [...this.tutors];
        } else {
            this.filteredTutors = this.tutors.filter(tutor => tutor.subject === subject);
        }
        
        // Appliquer aussi la recherche si active
        if (this.searchQuery) {
            this.applySearch();
        } else {
            this.applySort();
        }
    }

    applySearch() {
        if (!this.searchQuery.trim()) {
            // Si recherche vide, utiliser le filtre actuel
            this.applyFilter(this.currentFilter);
            return;
        }
        
        const query = this.searchQuery.toLowerCase();
        this.filteredTutors = this.tutors.filter(tutor => {
            const searchFields = [
                tutor.name,
                tutor.subjectName,
                tutor.description,
                tutor.education,
                ...(tutor.languages || []),
                ...(tutor.specialties || [])
            ];
            
            return searchFields.some(field => 
                field && field.toString().toLowerCase().includes(query)
            );
        });
        
        this.applySort();
    }

    applySort() {
        switch(this.currentSort) {
            case 'rating':
                this.filteredTutors.sort((a, b) => b.rating - a.rating);
                break;
            case 'name':
                this.filteredTutors.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'available':
                this.filteredTutors.sort((a, b) => {
                    if (a.available === b.available) return 0;
                    return a.available ? -1 : 1;
                });
                break;
            case 'price':
                this.filteredTutors.sort((a, b) => a.pricePerHour - b.pricePerHour);
                break;
            case 'experience':
                this.filteredTutors.sort((a, b) => {
                    const expA = parseInt(a.experience) || 0;
                    const expB = parseInt(b.experience) || 0;
                    return expB - expA;
                });
                break;
        }
        
        this.renderTutors();
    }

    renderTutors() {
        const container = document.getElementById('tutor-list-container');
        const noResults = document.getElementById('no-results');
        const resultsCount = document.getElementById('results-count');
        const filterInfo = document.getElementById('filter-info');
        
        if (!container) return;
        
        // Afficher le message "aucun résultat" si besoin
        if (this.filteredTutors.length === 0) {
            container.innerHTML = '';
            if (noResults) noResults.classList.remove('hidden');
            if (resultsCount) resultsCount.textContent = '(0)';
            if (filterInfo) {
                filterInfo.textContent = 'Aucun résultat pour vos critères de recherche';
                filterInfo.classList.add('text-red-500');
            }
            return;
        }
        
        // Cacher le message "aucun résultat"
        if (noResults) noResults.classList.add('hidden');
        
        // Mettre à jour les informations
        if (resultsCount) resultsCount.textContent = `(${this.filteredTutors.length})`;
        if (filterInfo) {
            filterInfo.textContent = this.getFilterInfoText();
            filterInfo.classList.remove('text-red-500');
        }
        
        // Générer les cartes de tuteur
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${this.filteredTutors.map(tutor => this.createTutorCard(tutor)).join('')}
            </div>
        `;
    }

    // Remplacer TOUTE la fonction createTutorCard (lignes 201-250) par :

    createTutorCard(tutor) {
        const subjectColor = this.getSubjectColor(tutor.subject);
        const availabilityText = tutor.available ? 'Disponible' : 'Indisponible';
        const availabilityClass = tutor.available ? 'available' : 'busy';
        const onlineStatus = tutor.online ? 'En ligne' : 'Hors ligne';
        const onlineClass = tutor.online ? 'online' : 'offline';
        
        // Formater le prix
        const priceFormatted = new Intl.NumberFormat('fr-CF', {
            style: 'currency',
            currency: 'XAF'
        }).format(tutor.pricePerHour);
        
        return `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover fade-in" data-tutor-id="${tutor.id}">
                <!-- En-tête avec couleur de matière -->
                <div class="h-2" style="background-color: ${subjectColor}"></div>
                
                <div class="p-6">
                    <!-- Avatar et nom -->
                    <div class="flex items-start gap-4 mb-4">
                        <div class="flex-shrink-0">
                            <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold" 
                                 style="background-color: ${subjectColor}">
                                ${tutor.avatar || this.generateAvatar(tutor.name)}
                            </div>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-gray-800">${tutor.name}</h3>
                            <p class="text-gray-600">${tutor.subjectName}</p>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-yellow-500 font-bold">
                                    <i class="fas fa-star"></i> ${tutor.rating.toFixed(1)}
                                </span>
                                <span class="text-gray-500 text-sm">(${tutor.reviews || 0} avis)</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Description -->
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">${tutor.description || 'Tuteur expérimenté'}</p>
                    
                    <!-- Informations -->
                    <div class="space-y-2 mb-4">
                        <div class="flex items-center text-sm">
                            <i class="fas fa-graduation-cap text-gray-400 mr-2 w-5"></i>
                            <span class="text-gray-600">${tutor.education || 'Formation académique'}</span>
                        </div>
                        <div class="flex items-center text-sm">
                            <i class="fas fa-language text-gray-400 mr-2 w-5"></i>
                            <span class="text-gray-600">${tutor.languages ? tutor.languages.join(', ') : 'Français'}</span>
                        </div>
                        <div class="flex items-center text-sm">
                            <i class="fas fa-clock text-gray-400 mr-2 w-5"></i>
                            <span class="text-gray-600">${tutor.experience || 'Plusieurs années'} d'expérience</span>
                        </div>
                    </div>
                    
                    <!-- Spécialités -->
                    <div class="mb-4">
                        <div class="flex flex-wrap gap-1">
                            ${(tutor.specialties || ['Expert']).map(specialty => `
                                <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    ${specialty}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Statut et prix -->
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <span class="px-3 py-1 rounded-full text-sm font-bold ${availabilityClass}">
                                ${availabilityText}
                            </span>
                            <div class="text-xs text-gray-500 mt-1">
                                <span class="${onlineClass}"></span>${onlineStatus}
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-bold text-[#1A3B52]">${priceFormatted}/h</p>
                            <p class="text-xs text-gray-500">Tarif horaire</p>
                        </div>
                    </div>
                    
                    <!-- Bouton d'action - VERSION CORRIGÉE -->
                    <button class="w-full py-3 bg-gradient-to-r from-[#1A3B52] to-[#2C5282] text-white rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                            onclick="selectTutor('${tutor.id}', '${encodeURIComponent(tutor.name)}', '${tutor.subject}')"
                            ${!tutor.available ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        <i class="fas fa-video"></i>
                        ${tutor.available ? 'Rejoindre la session' : 'Indisponible'}
                    </button>
                </div>
            </div>
        `;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // Étoiles pleines
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-yellow-500"></i>';
        }
        
        // Demi-étoile
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-yellow-500"></i>';
        }
        
        // Étoiles vides
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-yellow-500"></i>';
        }
        
        return stars;
    }

    getSubjectColor(subject) {
        const colors = {
            'math': '#FFD700',
            'physics': '#FFA500',
            'info': '#089182',
            'literature': '#8B3A9E',
            'science': '#8B7355'
        };
        return colors[subject] || '#6B7280';
    }

    generateAvatar(name) {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    updateStatistics() {
        const totalTutors = this.tutors.length;
        const onlineTutors = this.tutors.filter(t => t.online).length;
        const avgRating = this.tutors.length > 0 
            ? (this.tutors.reduce((sum, t) => sum + t.rating, 0) / this.tutors.length).toFixed(1)
            : '0.0';
        
        const totalEl = document.getElementById('total-tutors');
        const onlineEl = document.getElementById('online-tutors');
        const ratingEl = document.getElementById('avg-rating');
        
        if (totalEl) totalEl.textContent = totalTutors;
        if (onlineEl) onlineEl.textContent = onlineTutors;
        if (ratingEl) ratingEl.textContent = avgRating;
    }

    getFilterInfoText() {
        if (this.searchQuery) {
            return `${this.filteredTutors.length} résultat(s) pour "${this.searchQuery}"`;
        }
        if (this.currentFilter !== 'all') {
            const subjectName = this.getSubjectName(this.currentFilter);
            return `${this.filteredTutors.length} tuteur(s) en ${subjectName}`;
        }
        return `${this.filteredTutors.length} tuteur(s) disponibles`;
    }

    getSubjectName(subjectId) {
        const subjects = {
            'math': 'Mathématiques',
            'physics': 'Physique',
            'info': 'Informatique',
            'literature': 'Littérature',
            'science': 'Sciences'
        };
        return subjects[subjectId] || subjectId;
    }

    resetFilters() {
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.currentSort = 'rating';
        
        // Réinitialiser les éléments UI
        const searchInput = document.getElementById('global-search');
        if (searchInput) searchInput.value = '';
        
        const sortSelect = document.getElementById('sort-options');
        if (sortSelect) sortSelect.value = 'rating';
        
        // Réinitialiser les boutons de filtre
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active', 'ring-2', 'ring-offset-2', 'ring-[#1A3B52]');
            if (btn.dataset.subject === 'all') {
                btn.classList.add('active', 'ring-2', 'ring-offset-2', 'ring-[#1A3B52]');
            }
        });
        
        // Réappliquer les filtres
        this.applyFilter('all');
        
        // Notification
        if (typeof showNotification === 'function') {
            showNotification('Filtres réinitialisés', 'Tous les tuteurs sont affichés', 'success');
        }
    }

    showError(message) {
        const container = document.getElementById('tutor-list-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-700 mb-2">Erreur de chargement</h3>
                    <p class="text-gray-500 mb-4">${message}</p>
                    <button onclick="window.location.reload()" class="px-4 py-2 bg-[#1A3B52] text-white rounded-lg hover:bg-blue-900">
                        <i class="fas fa-redo mr-2"></i>Réessayer
                    </button>
                </div>
            `;
        }
    }
}

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initialisation TutorListManager...');
    window.tutorListManager = new TutorListManager();
});