// src/services/ForumService.js

class ForumService {
    constructor() {
        // On suppose que Firebase est déjà initialisé ailleurs
        // (par un autre service du groupe)
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        
        // Collections Firestore
        this.forumsCollection = this.db.collection('forums');
        this.commentsCollection = this.db.collection('comments');
    }

    // ==================== OPÉRATIONS FORUMS ====================

    /**
     * Créer un nouveau forum
     * @param {Object} forumData - Données du forum
     * @param {string} forumData.title - Titre du forum
     * @param {string} forumData.content - Contenu du forum
     * @param {string} forumData.category - Catégorie (optionnel)
     * @returns {Promise<Object>} - Résultat de l'opération
     */
    async createForum(forumData) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                return {
                    success: false,
                    error: 'Vous devez être connecté pour créer un forum'
                };
            }

            if (!forumData.title || !forumData.content) {
                return {
                    success: false,
                    error: 'Le titre et le contenu sont obligatoires'
                };
            }

            const forum = {
                title: forumData.title.trim(),
                content: forumData.content.trim(),
                authorId: user.uid,
                authorName: user.displayName || user.email.split('@')[0],
                category: forumData.category || 'Général',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                views: 0,
                commentsCount: 0,
                likes: 0,
                isResolved: false
            };

            const docRef = await this.forumsCollection.add(forum);
            
            return {
                success: true,
                id: docRef.id,
                ...forum
            };
        } catch (error) {
            console.error('ForumService - Erreur création forum:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Récupérer tous les forums avec filtres optionnels
     * @param {Object} options - Options de filtrage
     * @param {string} options.category - Filtrer par catégorie
     * @param {string} options.sortBy - 'recent', 'popular', 'unanswered'
     * @returns {Promise<Array>} - Liste des forums
     */
    async getForums(options = {}) {
        try {
            let query = this.forumsCollection;
            
            // Filtre par catégorie
            if (options.category && options.category !== 'all') {
                query = query.where('category', '==', options.category);
            }
            
            // Tri
            switch(options.sortBy) {
                case 'popular':
                    query = query.orderBy('views', 'desc');
                    break;
                case 'unanswered':
                    query = query.where('isResolved', '==', false);
                    query = query.orderBy('createdAt', 'desc');
                    break;
                default: // 'recent' ou par défaut
                    query = query.orderBy('createdAt', 'desc');
            }
            
            const snapshot = await query.get();
            
            const forums = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            return {
                success: true,
                forums: forums
            };
        } catch (error) {
            console.error('ForumService - Erreur récupération forums:', error);
            return {
                success: false,
                error: error.message,
                forums: []
            };
        }
    }

    /**
     * Récupérer un forum par son ID
     * @param {string} forumId - ID du forum
     * @returns {Promise<Object>} - Forum et ses données
     */
    async getForumById(forumId) {
        try {
            const doc = await this.forumsCollection.doc(forumId).get();
            
            if (!doc.exists) {
                return {
                    success: false,
                    error: 'Forum non trouvé'
                };
            }
            
            // Incrémenter les vues
            await this.forumsCollection.doc(forumId).update({
                views: firebase.firestore.FieldValue.increment(1)
            });
            
            return {
                success: true,
                forum: {
                    id: doc.id,
                    ...doc.data()
                }
            };
        } catch (error) {
            console.error('ForumService - Erreur récupération forum:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Mettre à jour un forum
     * @param {string} forumId - ID du forum
     * @param {Object} updates - Données à mettre à jour
     * @returns {Promise<Object>} - Résultat
     */
    async updateForum(forumId, updates) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                return {
                    success: false,
                    error: 'Non autorisé'
                };
            }

            // Vérifier que l'utilisateur est l'auteur (simplifié)
            const forum = await this.getForumById(forumId);
            if (!forum.success) {
                return forum;
            }
            
            if (forum.forum.authorId !== user.uid) {
                return {
                    success: false,
                    error: 'Vous n\'êtes pas l\'auteur de ce forum'
                };
            }

            await this.forumsCollection.doc(forumId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            console.error('ForumService - Erreur mise à jour forum:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ==================== OPÉRATIONS COMMENTAIRES ====================

    /**
     * Ajouter un commentaire à un forum
     * @param {string} forumId - ID du forum
     * @param {string} content - Contenu du commentaire
     * @returns {Promise<Object>} - Résultat
     */
    async addComment(forumId, content) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                return {
                    success: false,
                    error: 'Vous devez être connecté pour commenter'
                };
            }

            if (!content || content.trim() === '') {
                return {
                    success: false,
                    error: 'Le commentaire ne peut pas être vide'
                };
            }

            const comment = {
                forumId: forumId,
                content: content.trim(),
                authorId: user.uid,
                authorName: user.displayName || user.email.split('@')[0],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0,
                isSolution: false
            };

            // Ajouter le commentaire
            await this.commentsCollection.add(comment);
            
            // Mettre à jour le compteur de commentaires
            await this.forumsCollection.doc(forumId).update({
                commentsCount: firebase.firestore.FieldValue.increment(1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return {
                success: true,
                comment: comment
            };
        } catch (error) {
            console.error('ForumService - Erreur ajout commentaire:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Récupérer les commentaires d'un forum
     * @param {string} forumId - ID du forum
     * @returns {Promise<Array>} - Liste des commentaires
     */
    async getComments(forumId) {
        try {
            const snapshot = await this.commentsCollection
                .where('forumId', '==', forumId)
                .orderBy('createdAt', 'asc')
                .get();
            
            const comments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            return {
                success: true,
                comments: comments
            };
        } catch (error) {
            console.error('ForumService - Erreur récupération commentaires:', error);
            return {
                success: false,
                error: error.message,
                comments: []
            };
        }
    }

    /**
     * Marquer un commentaire comme solution
     * @param {string} forumId - ID du forum
     * @param {string} commentId - ID du commentaire
     * @returns {Promise<Object>} - Résultat
     */
    async markAsSolution(forumId, commentId) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                return {
                    success: false,
                    error: 'Non autorisé'
                };
            }

            // Vérifier que l'utilisateur est l'auteur du forum
            const forum = await this.getForumById(forumId);
            if (!forum.success) {
                return forum;
            }
            
            if (forum.forum.authorId !== user.uid) {
                return {
                    success: false,
                    error: 'Seul l\'auteur du forum peut marquer une solution'
                };
            }

            // Désactiver toutes les autres solutions pour ce forum
            const comments = await this.getComments(forumId);
            if (comments.success) {
                const batch = this.db.batch();
                
                comments.comments.forEach(comment => {
                    if (comment.isSolution && comment.id !== commentId) {
                        const commentRef = this.commentsCollection.doc(comment.id);
                        batch.update(commentRef, { isSolution: false });
                    }
                });
                
                // Marquer le nouveau commentaire comme solution
                const solutionRef = this.commentsCollection.doc(commentId);
                batch.update(solutionRef, { isSolution: true });
                
                // Mettre à jour le forum
                const forumRef = this.forumsCollection.doc(forumId);
                batch.update(forumRef, { 
                    isResolved: true,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                await batch.commit();
            }
            
            return { success: true };
        } catch (error) {
            console.error('ForumService - Erreur marquage solution:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Supprimer un forum (et ses commentaires)
     * @param {string} forumId - ID du forum
     * @returns {Promise<Object>} - Résultat
     */
    async deleteForum(forumId) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                return {
                    success: false,
                    error: 'Non autorisé'
                };
            }

            // Vérifier que l'utilisateur est l'auteur
            const forum = await this.getForumById(forumId);
            if (!forum.success) {
                return forum;
            }
            
            if (forum.forum.authorId !== user.uid) {
                return {
                    success: false,
                    error: 'Vous n\'êtes pas l\'auteur de ce forum'
                };
            }

            // Supprimer d'abord tous les commentaires
            const comments = await this.getComments(forumId);
            if (comments.success) {
                const batch = this.db.batch();
                comments.comments.forEach(comment => {
                    batch.delete(this.commentsCollection.doc(comment.id));
                });
                await batch.commit();
            }
            
            // Supprimer le forum
            await this.forumsCollection.doc(forumId).delete();
            
            return { success: true };
        } catch (error) {
            console.error('ForumService - Erreur suppression forum:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Rechercher des forums par mot-clé
     * @param {string} searchTerm - Terme de recherche
     * @returns {Promise<Array>} - Forums correspondants
     */
    async searchForums(searchTerm) {
        try {
            const allForums = await this.getForums();
            
            if (!allForums.success) {
                return allForums;
            }
            
            const term = searchTerm.toLowerCase();
            const filtered = allForums.forums.filter(forum => 
                forum.title.toLowerCase().includes(term) ||
                forum.content.toLowerCase().includes(term) ||
                forum.authorName.toLowerCase().includes(term)
            );
            
            return {
                success: true,
                forums: filtered
            };
        } catch (error) {
            console.error('ForumService - Erreur recherche:', error);
            return {
                success: false,
                error: error.message,
                forums: []
            };
        }
    }

    /**
     * Récupérer les forums d'un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @returns {Promise<Array>} - Forums de l'utilisateur
     */
    async getUserForums(userId) {
        try {
            const snapshot = await this.forumsCollection
                .where('authorId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const forums = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            return {
                success: true,
                forums: forums
            };
        } catch (error) {
            console.error('ForumService - Erreur forums utilisateur:', error);
            return {
                success: false,
                error: error.message,
                forums: []
            };
        }
    }
}

// Exporter une instance unique
const forumService = new ForumService();
export default forumService;