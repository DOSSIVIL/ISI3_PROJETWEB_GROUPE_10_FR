// ==================== FONCTION POUR RÉCUPÉRER LES INFOS UTILISATEUR DEPUIS FIRESTORE ====================
async function getUserDataFromFirestore() {
    try {
        // 1. Récupérer l'email et la catégorie depuis sessionStorage
        const userInfo = JSON.parse(sessionStorage.getItem('user_info'));
        
        if (!userInfo || !userInfo.email || !userInfo.category) {
            console.log('❌ Pas d\'infos dans sessionStorage');
            return null;
        }
        
        console.log('Recherche pour:', userInfo.email, '- Catégorie:', userInfo.category);
        
        // 2. Déterminer la table selon la catégorie
        let tableName = '';
        if (userInfo.category === 'enseignant') {
            tableName = 'enseignants';
        } else if (userInfo.category === 'etudiant') {
            tableName = 'etudiants';
        } else {
            console.log('❌ Catégorie inconnue');
            return null;
        }
        
        // 3. Chercher dans Firestore
        if (!firebaseDb) {
            console.log('❌ Firestore pas dispo');
            return null;
        }
        
        const db = firebase.firestore();
        
        // Chercher par email dans la table correspondante
        const querySnapshot = await db.collection(tableName)
            .where('email', '==', userInfo.email)
            .limit(1)
            .get();
        
        if (querySnapshot.empty) {
            console.log(`❌ Utilisateur ${userInfo.email} non trouvé dans ${tableName}`);
            return null;
        }
        
        // 4. Récupérer toutes les données du document
        const userDoc = querySnapshot.docs[0];
        const allUserData = userDoc.data();
        const userId = userDoc.id;
        
        console.log(`✅ Utilisateur trouvé:`, allUserData);
        
        // 5. Retourner toutes les données
        return {
            id: userId,
            email: userInfo.email,
            category: userInfo.category,
            ...allUserData
        };
        
    } catch (error) {
        console.error('❌ Erreur Firestore:', error);
        return null;
    }
}