// dashboard.js - Gestion du dashboard enseignant

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Générer le calendrier
    generateCalendar();
    
    // Initialiser la navigation
    initNavigation();
    
    // Gérer les ancres pour le défilement
    initAnchors();
    
    // Mettre en évidence le menu actif initial
    updateActiveMenuOnLoad();
});

// Générer le calendrier
function generateCalendar() {
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    
    const daysInMonth = 31;
    const firstDay = 0;
    const today = 14;
    const sessionsDay = [14, 15, 17, 18, 22, 25];

    // Effacer le contenu existant
    calendar.innerHTML = '';

    // Ajouter les jours vides
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        calendar.appendChild(emptyDay);
    }

    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day w-8 h-8 flex items-center justify-center rounded-lg text-sm cursor-pointer';
        dayDiv.textContent = day;

        if (day === today) {
            dayDiv.className += ' bg-purple-600 text-white font-bold';
        } else if (sessionsDay.includes(day)) {
            dayDiv.className += ' bg-purple-100 text-purple-600 font-semibold';
        } else {
            dayDiv.className += ' text-gray-700 hover:bg-gray-100';
        }

        calendar.appendChild(dayDiv);
    }
}

// Initialiser la navigation asynchrone
function initNavigation() {
    const content = document.getElementById('ContenuPrincipal');
    if (!content) return;
    
    // Délégation d'événements pour tous les liens async
    document.addEventListener('click', function(e) {
        const asyncLink = e.target.closest('.async-link');
        if (asyncLink && asyncLink.href && !asyncLink.href.includes('#')) {
            e.preventDefault();
            e.stopPropagation();
            
            const url = asyncLink.getAttribute('href');
            loadPage(url, asyncLink);
        }
    });
    
    // Gestionnaire spécifique pour le lien étudiants (si présent)
    const etudiantsLink = document.getElementById('etudiantsLink');
    if (etudiantsLink) {
        etudiantsLink.addEventListener('click', function(e) {
            e.preventDefault();
            loadPage(this.getAttribute('href'), this);
        });
    }
}

// Charger une page
function loadPage(url, clickedLink) {
    const content = document.getElementById('ContenuPrincipal');
    if (!content) return;
    
    // Afficher un indicateur de chargement
    content.innerHTML = `
        <div class="flex items-center justify-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
    `;
    
    // Charger la page
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            content.innerHTML = html;
            
            // Réinitialiser les événements dans le nouveau contenu
            reinitializeEvents();
            
            // Mettre à jour le menu actif
            updateActiveMenu(clickedLink);
            
            // Ajouter une classe pour l'animation
            content.classList.add('page-transition');
            setTimeout(() => {
                content.classList.remove('page-transition');
            }, 300);
        })
        .catch(error => {
            console.error('Erreur lors du chargement de la page :', error);
            content.innerHTML = `
                <div class="p-8 text-center">
                    <div class="text-red-500 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Erreur de chargement</h3>
                    <p class="text-gray-600 mb-4">Impossible de charger la page. Veuillez réessayer.</p>
                    <button onclick="loadPage('/src/views/templates/dashboard.html')" class="px-4 py-2 gradient-bg text-white rounded-lg">
                        Retour au tableau de bord
                    </button>
                </div>
            `;
        });
}

// Réinitialiser les événements dans le nouveau contenu
function reinitializeEvents() {
    // Réinitialiser les boutons, formulaires, etc.
    document.querySelectorAll('button').forEach(button => {
        if (button.classList.contains('gradient-bg')) {
            button.addEventListener('click', function() {
                console.log('Bouton cliqué:', this.textContent);
            });
        }
    });
}

// Mettre à jour le menu actif
function updateActiveMenu(clickedLink) {
    // Retirer la classe active de tous les liens
    document.querySelectorAll('.async-link').forEach(link => {
        link.classList.remove('active-menu', 'text-white', 'gradient-bg');
        link.classList.add('text-gray-600');
    });
    
    // Ajouter la classe active au lien cliqué
    clickedLink.classList.remove('text-gray-600');
    clickedLink.classList.add('active-menu', 'text-white', 'gradient-bg');
}

// Mettre à jour le menu actif au chargement
function updateActiveMenuOnLoad() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.async-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.includes(linkPath) || 
            (currentPath === '/' && linkPath.includes('dashboard'))) {
            link.classList.remove('text-gray-600');
            link.classList.add('active-menu', 'text-white', 'gradient-bg');
        }
    });
}

// Gérer les ancres
function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Exposer les fonctions globales
window.loadPage = loadPage;
window.generateCalendar = generateCalendar;