// Script principal
document.addEventListener('DOMContentLoaded', function() {
    // Gestion du menu mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.className = mobileMenu.classList.contains('hidden') 
                    ? 'fas fa-bars' 
                    : 'fas fa-times';
            }
        });
    }
    
    // Animation des cartes au chargement
    const cards = document.querySelectorAll('.category-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
    
    // Gestion de la recherche
    const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Rechercher"]');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    alert(`Recherche pour: ${query}\n(Fonctionnalité à implémenter)`);
                }
            }
        });
    });
    
    // Effet de survol sur les cartes
    const categoryCards = document.querySelectorAll('.bg-white.rounded-2xl');
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Notification de bienvenue
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        setTimeout(() => {
            console.log('Bienvenue sur EduConnect Africa !');
        }, 1000);
    }
});