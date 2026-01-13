// Gestion du dark mode
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
    
    // Vérifier la préférence utilisateur
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const storedTheme = localStorage.getItem('theme');
    
    // Appliquer le thème sauvegardé ou la préférence système
    if (storedTheme === 'dark' || (!storedTheme && prefersDarkScheme.matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    // Fonction pour basculer le thème
    function toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Mettre à jour l'icône
        const icon = document.querySelector('#darkModeToggle i, #darkModeToggleMobile i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun text-yellow-300' : 'fas fa-moon text-gray-700';
        }
    }
    
    // Ajouter les écouteurs d'événements
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    if (darkModeToggleMobile) {
        darkModeToggleMobile.addEventListener('click', toggleDarkMode);
    }
    
    // Mettre à jour l'icône initiale
    updateDarkModeIcon();
    
    function updateDarkModeIcon() {
        const isDark = document.documentElement.classList.contains('dark');
        const icons = document.querySelectorAll('#darkModeToggle i, #darkModeToggleMobile i');
        
        icons.forEach(icon => {
            if (icon) {
                icon.className = isDark ? 'fas fa-sun text-yellow-300' : 'fas fa-moon text-gray-700';
            }
        });
    }
});