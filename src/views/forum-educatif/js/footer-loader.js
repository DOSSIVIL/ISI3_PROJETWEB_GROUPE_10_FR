// Chargement dynamique du footer
document.addEventListener('DOMContentLoaded', function() {
    const footerContainer = document.getElementById('footer-container');
    
    if (footerContainer) {
        // Utiliser le chemin relatif spécifié
        const footerPath = '/src/views/templates/footer.html';
        
        fetch(footerPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                footerContainer.innerHTML = data;
                console.log('Footer chargé avec succès');
            })
            .catch(error => {
                console.error('Erreur lors du chargement du footer:', error);
                footerContainer.innerHTML = `
                    <footer class="bg-gray-800 text-white py-8 text-center">
                        <p>© 2024 EduConnect Africa. Tous droits réservés.</p>
                        <p class="text-sm text-gray-400 mt-2">Erreur de chargement du footer complet</p>
                    </footer>
                `;
            });
    }
});