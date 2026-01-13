// src/controllers/ForumController.js

// On suppose que Firebase est déjà initialisé globalement
// Sinon, ajoutez votre configuration Firebase ici

class ForumController {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.currentUser = null;
        this.currentForumId = null;
    }

    /**
     * Initialisation du contrôleur
     */
    async init() {
        try {
            // Écouter les changements d'authentification
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.updateAuthUI();
            });
            
            console.log('✅ ForumController initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation ForumController:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour l'UI selon l'état d'authentification
     */
    updateAuthUI() {
        const authElements = document.querySelectorAll('.auth-only');
        const unauthElements = document.querySelectorAll('.unauth-only');
        
        if (this.currentUser) {
            authElements.forEach(el => el.style.display = 'block');
            unauthElements.forEach(el => el.style.display = 'none');
        } else {
            authElements.forEach(el => el.style.display = 'none');
            unauthElements.forEach(el => el.style.display = 'block');
        }
    }

    /**
     * Afficher la liste des forums
     */
    async showForumList(container) {
        try {
            // Afficher le chargement
            container.innerHTML = this.getLoadingHTML();
            
            // Récupérer les forums
            const forums = await this.getForums();
            
            // Afficher la liste
            container.innerHTML = this.renderForumList(forums);
            
            // Initialiser les événements
            this.initForumListEvents();
            
        } catch (error) {
            console.error('Erreur showForumList:', error);
            container.innerHTML = this.getErrorHTML('Erreur lors du chargement des forums');
        }
    }

    /**
     * Récupérer les forums depuis Firebase
     */
    async getForums(filters = {}) {
        try {
            let query = this.db.collection('forums');
            
            // Appliquer les filtres
            if (filters.category && filters.category !== 'all') {
                query = query.where('category', '==', filters.category);
            }
            
            // Appliquer le tri
            switch(filters.sortBy) {
                case 'popular':
                    query = query.orderBy('views', 'desc');
                    break;
                case 'unanswered':
                    query = query.where('isResolved', '==', false);
                    break;
                default: // 'recent'
                    query = query.orderBy('createdAt', 'desc');
            }
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Erreur getForums:', error);
            throw error;
        }
    }

    /**
     * Rendre la liste des forums
     */
    renderForumList(forums) {
        if (forums.length === 0) {
            return `
                <div class="text-center py-12">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
                        <i class="fas fa-comments text-purple-600 text-2xl"></i>
                    </div>
                    <h3 class="mt-4 text-lg font-semibold text-gray-900">Aucune discussion</h3>
                    <p class="mt-2 text-gray-600">Soyez le premier à lancer une discussion !</p>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                ${forums.map(forum => this.renderForumItem(forum)).join('')}
            </div>
        `;
    }

    /**
     * Rendre un élément de forum
     */
    renderForumItem(forum) {
        // Formater la date
        const date = forum.createdAt?.toDate 
            ? new Date(forum.createdAt.toDate()).toLocaleDateString('fr-FR')
            : 'Date inconnue';
        
        // Échapper le HTML pour la sécurité
        const escapeHTML = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };
        
        return `
            <div class="forum-item" data-forum-id="${forum.id}">
                <div class="flex flex-col md:flex-row md:items-start">
                    <div class="flex-grow">
                        <h3 class="forum-title">
                            <a href="/src/views/templates/forum-detail.html?id=${forum.id}" 
                               class="hover:text-purple-600 transition-colors">
                                ${escapeHTML(forum.title)}
                            </a>
                            ${forum.isResolved ? 
                                '<span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Résolu</span>' : 
                                ''}
                        </h3>
                        
                        <div class="flex items-center mt-2 space-x-3">
                            <span class="badge-category bg-category-${forum.category.toLowerCase()}">
                                ${forum.category}
                            </span>
                            <span class="text-sm text-gray-500">
                                <i class="fas fa-user mr-1"></i>${escapeHTML(forum.authorName || 'Anonyme')}
                            </span>
                            <span class="text-sm text-gray-500">
                                <i class="fas fa-calendar mr-1"></i>${date}
                            </span>
                        </div>
                        
                        <p class="forum-content-preview mt-3">
                            ${escapeHTML(forum.content.substring(0, 200))}...
                        </p>
                    </div>
                    
                    <div class="mt-4 md:mt-0 md:ml-4 flex md:flex-col items-center md:items-end space-x-4 md:space-x-0 md:space-y-2">
                        <div class="flex items-center text-gray-500">
                            <i class="fas fa-eye mr-1"></i>
                            <span>${forum.views || 0}</span>
                        </div>
                        <div class="flex items-center text-gray-500">
                            <i class="fas fa-comment mr-1"></i>
                            <span>${forum.commentsCount || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialiser les événements de la liste
     */
    initForumListEvents() {
        // Gérer les filtres
        document.getElementById('category-filter')?.addEventListener('change', async (e) => {
            const container = document.getElementById('forum-content');
            const filters = {
                category: e.target.value,
                sortBy: document.getElementById('sort-filter').value
            };
            await this.showFilteredForums(container, filters);
        });
        
        document.getElementById('sort-filter')?.addEventListener('change', async (e) => {
            const container = document.getElementById('forum-content');
            const filters = {
                category: document.getElementById('category-filter').value,
                sortBy: e.target.value
            };
            await this.showFilteredForums(container, filters);
        });
    }

    /**
     * Afficher les forums filtrés
     */
    async showFilteredForums(container, filters) {
        try {
            container.innerHTML = this.getLoadingHTML();
            const forums = await this.getForums(filters);
            container.innerHTML = this.renderForumList(forums);
        } catch (error) {
            container.innerHTML = this.getErrorHTML('Erreur lors du filtrage');
        }
    }

    /**
     * Créer un nouveau forum
     */
    async createForum(title, content, category) {
        try {
            if (!this.currentUser) {
                throw new Error('Vous devez être connecté pour créer un forum');
            }

            const forumData = {
                title: title.trim(),
                content: content.trim(),
                category: category || 'Général',
                authorId: this.currentUser.uid,
                authorName: this.currentUser.displayName || this.currentUser.email.split('@')[0],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                views: 0,
                commentsCount: 0,
                likes: 0,
                isResolved: false
            };

            await this.db.collection('forums').add(forumData);
            
        } catch (error) {
            console.error('Erreur createForum:', error);
            throw error;
        }
    }

    // ==================== UTILITAIRES ====================

    getLoadingHTML() {
        return `
            <div class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                <p class="mt-4 text-gray-600">Chargement des discussions...</p>
            </div>
        `;
    }

    getErrorHTML(message) {
        return `
            <div class="text-center py-12">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                    <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                </div>
                <h3 class="mt-4 text-lg font-semibold text-gray-900">Erreur</h3>
                <p class="mt-2 text-gray-600">${message}</p>
            </div>
        `;
    }
}

// Exporter une instance unique
const forumController = new ForumController();
export default forumController;