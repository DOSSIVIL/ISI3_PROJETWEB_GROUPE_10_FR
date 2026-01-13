// Utilisation basique
document.addEventListener('DOMContentLoaded', async () => {
    const userData = await window.UserProfileManager.init();
    
    if (userData) {
        // Afficher les données
        console.log('Profil chargé:', userData);
        
        // Utiliser les données
        document.getElementById('app').innerHTML = `
            <h1>Bienvenue ${userData.prenom} !</h1>
            <p>Vous êtes ${userData.role === 'etudiant' ? 'étudiant' : 'enseignant'}</p>
            <p>Email: ${userData.email}</p>
        `;
    }
});

// Ou utiliser l'API complète
if (window.UserProfileManager.isAuthenticated()) {
    const role = window.UserProfileManager.getUserRole();
    console.log(`Utilisateur connecté en tant que: ${role}`);
}