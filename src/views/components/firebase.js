// scripts/firebase-manager.js - CODE COMPLET CORRIGÉ
class FirebaseManager {
    constructor(config = null) {
        console.log('Initialisation de FirebaseManager...');
        
        this.db = null;
        this.auth = null;
        this.storage = null;
        this.messaging = null;
        this.currentUser = null;
        this.currentSessionId = null;
        this.unsubscribeFunctions = [];
        this.cache = {
            tutors: null,
            sessions: new Map(),
            messages: new Map(),
            files: new Map()
        };
        
        this.init(config);
    }

    async init(config = null) {
        try {
            // Vérifier si Firebase est disponible
            if (typeof firebase === 'undefined') {
                console.error('Firebase non chargé');
                throw new Error('Firebase SDK non chargé');
            }
            
            // Initialiser Firebase si pas déjà fait
            if (!firebase.apps.length) {
                if (config) {
                    firebase.initializeApp(config);
                } else if (window.firebaseConfig) {
                    firebase.initializeApp(window.firebaseConfig);
                } else {
                    // Essayer de charger depuis un fichier
                    try {
                        const response = await fetch('/config/firebase-config.json');
                        const firebaseConfig = await response.json();
                        firebase.initializeApp(firebaseConfig);
                    } catch (error) {
                        console.error('Impossible de charger la configuration Firebase:', error);
                        throw new Error('Configuration Firebase manquante');
                    }
                }
            }
            
            // Initialiser les services
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.storage = firebase.storage();
            this.messaging = firebase.messaging();
            
            // Activer la persistance hors ligne
            await this.enablePersistence();
            
            // Configurer l'authentification
            await this.setupAuth();
            
            console.log('FirebaseManager initialisé avec succès');
            
        } catch (error) {
            console.error('Erreur d\'initialisation FirebaseManager:', error);
            this.enableOfflineMode();
            throw error;
        }
    }

    async enablePersistence() {
        try {
            await this.db.enablePersistence({
                synchronizeTabs: true
            });
            console.log('Persistence Firestore activée');
        } catch (error) {
            if (error.code === 'failed-precondition') {
                console.warn('Persistence déjà activée dans un autre onglet');
            } else if (error.code === 'unimplemented') {
                console.warn('Le navigateur ne supporte pas la persistance');
            } else {
                console.error('Erreur de persistance:', error);
            }
        }
    }

    async setupAuth() {
        return new Promise((resolve) => {
            // Écouter les changements d'authentification
            this.auth.onAuthStateChanged(async (user) => {
                this.currentUser = user;
                
                if (user) {
                    console.log('Utilisateur connecté:', user.uid, user.isAnonymous ? '(anonyme)' : '');
                    
                    // Mettre à jour le statut utilisateur
                    await this.updateUserStatus(user.uid, 'online');
                    
                    // Configurer les notifications push
                    await this.setupMessaging(user.uid);
                    
                } else {
                    console.log('Aucun utilisateur connecté, connexion anonyme...');
                    
                    // Authentification anonyme
                    try {
                        await this.auth.signInAnonymously();
                    } catch (error) {
                        console.error('Erreur d\'authentification anonyme:', error);
                    }
                }
                
                resolve();
            });
            
            // Forcer la vérification initiale
            if (!this.auth.currentUser) {
                this.auth.signInAnonymously().catch(console.error);
            }
        });
    }

    async setupMessaging(userId) {
        try {
            // Demander la permission pour les notifications
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                // Obtenir le token FCM
                const token = await this.messaging.getToken({
                    vapidKey: 'VOTRE_CLE_VAPID' // À configurer
                });
                
                if (token) {
                    // Enregistrer le token dans Firestore
                    await this.db.collection('user_tokens').doc(userId).set({
                        token: token,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    
                    console.log('Token FCM enregistré');
                }
            }
            
            // Écouter les messages en arrière-plan
            this.messaging.onMessage((payload) => {
                console.log('Message reçu:', payload);
                this.showPushNotification(payload);
            });
            
        } catch (error) {
            console.error('Erreur de configuration des messages:', error);
        }
    }

    showPushNotification(payload) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const options = {
                body: payload.notification.body,
                icon: payload.notification.icon || '/icon.png',
                badge: '/badge.png',
                tag: payload.notification.tag,
                data: payload.data
            };
            
            const notification = new Notification(payload.notification.title, options);
            
            notification.onclick = () => {
                window.focus();
                notification.close();
                
                // Naviguer vers la session si applicable
                if (payload.data && payload.data.sessionId) {
                    window.location.href = `tutoring-room.html?session=${payload.data.sessionId}`;
                }
            };
        }
    }

    enableOfflineMode() {
        console.log('Mode hors ligne activé');
        // Les données seront mises en cache localement
        // et synchronisées quand la connexion revient
    }

    // Gestion des sessions
    async createSession(tutorId, studentId, subject = null) {
        try {
            const sessionData = {
                tutorId,
                studentId,
                subject,
                startTime: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active',
                participants: [tutorId, studentId],
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            };

            const sessionRef = await this.db.collection('sessions').add(sessionData);
            this.currentSessionId = sessionRef.id;
            
            console.log('Session créée:', sessionRef.id);
            
            // Mettre à jour le cache
            this.cache.sessions.set(sessionRef.id, sessionData);
            
            return sessionRef.id;

        } catch (error) {
            console.error('Erreur de création de session:', error);
            throw this.handleFirebaseError(error);
        }
    }

    async getSession(sessionId) {
        try {
            // Vérifier le cache
            if (this.cache.sessions.has(sessionId)) {
                return this.cache.sessions.get(sessionId);
            }
            
            const doc = await this.db.collection('sessions').doc(sessionId).get();
            
            if (doc.exists) {
                const sessionData = {
                    id: doc.id,
                    ...doc.data()
                };
                
                // Mettre en cache
                this.cache.sessions.set(sessionId, sessionData);
                
                return sessionData;
            }
            
            return null;

        } catch (error) {
            console.error('Erreur de récupération de session:', error);
            throw this.handleFirebaseError(error);
        }
    }

    async updateSession(sessionId, updates) {
        try {
            await this.db.collection('sessions').doc(sessionId).update({
                ...updates,
                lastActivity: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Mettre à jour le cache
            if (this.cache.sessions.has(sessionId)) {
                const cached = this.cache.sessions.get(sessionId);
                this.cache.sessions.set(sessionId, { ...cached, ...updates });
            }
            
            return true;

        } catch (error) {
            console.error('Erreur de mise à jour de session:', error);
            throw this.handleFirebaseError(error);
        }
    }

    // Messages de chat
    async sendChatMessage(sessionId, messageData) {
        try {
            // Validation
            if (!messageData.content || messageData.content.trim() === '') {
                throw new Error('Le message ne peut pas être vide');
            }
            
            if (messageData.content.length > 1000) {
                throw new Error('Le message est trop long (max 1000 caractères)');
            }
            
            const messageWithMeta = {
                content: messageData.content.trim(),
                type: messageData.type || 'text',
                senderName: messageData.senderName || 'Utilisateur',
                senderId: this.currentUser?.uid,
                sessionId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                readBy: [this.currentUser?.uid]
            };

            const messageRef = await this.db.collection('messages').add(messageWithMeta);
            
            // Mettre à jour la dernière activité de la session
            await this.updateSession(sessionId, {
                lastMessage: messageWithMeta.content.substring(0, 50) + '...',
                lastMessageTime: messageWithMeta.timestamp
            });
            
            console.log('Message envoyé:', messageRef.id);
            
            return {
                success: true,
                messageId: messageRef.id
            };

        } catch (error) {
            console.error('Erreur d\'envoi de message:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getChatMessages(sessionId, limit = 50, startAfter = null) {
        try {
            // Vérifier le cache
            const cacheKey = `${sessionId}_${limit}_${startAfter}`;
            if (this.cache.messages.has(cacheKey)) {
                return this.cache.messages.get(cacheKey);
            }
            
            let query = this.db.collection('messages')
                .where('sessionId', '==', sessionId)
                .orderBy('timestamp', 'desc')
                .limit(limit);
            
            if (startAfter) {
                query = query.startAfter(startAfter);
            }
            
            const snapshot = await query.get();
            const messages = [];
            
            snapshot.forEach(doc => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Mettre en cache
            this.cache.messages.set(cacheKey, messages);
            
            return messages;

        } catch (error) {
            console.error('Erreur de récupération des messages:', error);
            return [];
        }
    }

    setupChatListener(sessionId, callback) {
        try {
            const unsubscribe = this.db.collection('messages')
                .where('sessionId', '==', sessionId)
                .orderBy('timestamp')
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            const message = {
                                id: change.doc.id,
                                ...change.doc.data()
                            };
                            
                            // Marquer comme lu si c'est notre message
                            if (message.senderId !== this.currentUser?.uid) {
                                this.markMessageAsRead(change.doc.id, sessionId);
                            }
                            
                            callback(message);
                        }
                    });
                });
            
            this.unsubscribeFunctions.push(unsubscribe);
            return unsubscribe;

        } catch (error) {
            console.error('Erreur de configuration du listener de chat:', error);
            return () => {};
        }
    }

    async markMessageAsRead(messageId, sessionId) {
        try {
            await this.db.collection('messages').doc(messageId).update({
                readBy: firebase.firestore.FieldValue.arrayUnion(this.currentUser?.uid)
            });
        } catch (error) {
            console.error('Erreur de marquage de message comme lu:', error);
        }
    }

    // Gestion des tuteurs
    async getTutors(filters = {}, forceRefresh = false) {
        try {
            const cacheKey = JSON.stringify(filters);
            
            // Vérifier le cache si pas de forceRefresh
            if (!forceRefresh && this.cache.tutors && this.cache.tutors.key === cacheKey) {
                const age = Date.now() - this.cache.tutors.timestamp;
                if (age < 300000) { // 5 minutes
                    return this.cache.tutors.data;
                }
            }
            
            let query = this.db.collection('tutors');
            
            // Appliquer les filtres
            if (filters.subject && filters.subject !== 'all') {
                query = query.where('subjects', 'array-contains', filters.subject);
            }
            
            if (filters.online !== undefined) {
                query = query.where('online', '==', filters.online);
            }
            
            if (filters.available !== undefined) {
                query = query.where('available', '==', filters.available);
            }
            
            if (filters.minRating) {
                query = query.where('rating', '>=', filters.minRating);
            }
            
            const snapshot = await query.get();
            const tutors = [];
            
            snapshot.forEach(doc => {
                tutors.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Trier par note (desc) si non filtré
            if (!filters.sortBy) {
                tutors.sort((a, b) => b.rating - a.rating);
            }
            
            // Mettre en cache
            this.cache.tutors = {
                key: cacheKey,
                data: tutors,
                timestamp: Date.now()
            };
            
            return tutors;

        } catch (error) {
            console.error('Erreur de récupération des tuteurs:', error);
            return [];
        }
    }

    async getTutorById(tutorId) {
        try {
            const doc = await this.db.collection('tutors').doc(tutorId).get();
            
            if (doc.exists) {
                return {
                    id: doc.id,
                    ...doc.data()
                };
            }
            
            return null;

        } catch (error) {
            console.error('Erreur de récupération du tuteur:', error);
            throw this.handleFirebaseError(error);
        }
    }

    async updateTutorStatus(tutorId, status) {
        try {
            await this.db.collection('tutors').doc(tutorId).update({
                online: status.online !== undefined ? status.online : true,
                available: status.available !== undefined ? status.available : true,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return true;

        } catch (error) {
            console.error('Erreur de mise à jour du statut:', error);
            throw this.handleFirebaseError(error);
        }
    }

    async updateUserStatus(userId, status) {
        try {
            await this.db.collection('users').doc(userId).set({
                status: status,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            return true;
        } catch (error) {
            console.error('Erreur de mise à jour du statut utilisateur:', error);
        }
    }

    // Fichiers partagés
    async uploadFile(sessionId, file) {
        try {
            // Validation
            if (!file || !file.type) {
                throw new Error('Fichier invalide');
            }
            
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error('Fichier trop volumineux (max 10MB)');
            }
            
            // Créer une référence unique
            const fileName = `${sessionId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const storageRef = this.storage.ref().child(fileName);
            
            // Uploader le fichier
            const uploadTask = storageRef.put(file);
            
            // Retourner une promesse avec progression
            return new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        // Émettre des événements de progression
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        const progressEvent = new CustomEvent('upload-progress', {
                            detail: { progress, fileName: file.name }
                        });
                        window.dispatchEvent(progressEvent);
                    },
                    (error) => {
                        console.error('Erreur d\'upload:', error);
                        reject(this.handleFirebaseError(error));
                    },
                    async () => {
                        try {
                            // Upload réussi, récupérer l'URL
                            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                            
                            // Enregistrer dans Firestore
                            const fileData = {
                                sessionId,
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                url: downloadURL,
                                storagePath: fileName,
                                uploadedBy: this.currentUser?.uid,
                                uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
                            };
                            
                            const fileRef = await this.db.collection('shared_files').add(fileData);
                            
                            resolve({
                                id: fileRef.id,
                                ...fileData
                            });
                            
                        } catch (error) {
                            reject(this.handleFirebaseError(error));
                        }
                    }
                );
            });

        } catch (error) {
            console.error('Erreur upload fichier:', error);
            throw this.handleFirebaseError(error);
        }
    }

    async getSharedFiles(sessionId, limit = 20) {
        try {
            const cacheKey = `${sessionId}_${limit}`;
            if (this.cache.files.has(cacheKey)) {
                return this.cache.files.get(cacheKey);
            }
            
            const snapshot = await this.db.collection('shared_files')
                .where('sessionId', '==', sessionId)
                .orderBy('uploadedAt', 'desc')
                .limit(limit)
                .get();

            const files = [];
            
            snapshot.forEach(doc => {
                files.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Mettre en cache
            this.cache.files.set(cacheKey, files);
            
            return files;

        } catch (error) {
            console.error('Erreur de récupération des fichiers:', error);
            return [];
        }
    }

    async deleteFile(fileId) {
        try {
            // Récupérer les infos du fichier
            const fileDoc = await this.db.collection('shared_files').doc(fileId).get();
            
            if (!fileDoc.exists) {
                throw new Error('Fichier non trouvé');
            }
            
            const fileData = fileDoc.data();
            
            // Supprimer du Storage
            if (fileData.storagePath) {
                await this.storage.ref().child(fileData.storagePath).delete();
            }
            
            // Supprimer de Firestore
            await this.db.collection('shared_files').doc(fileId).delete();
            
            // Nettoyer le cache
            this.cache.files.clear();
            
            return true;

        } catch (error) {
            console.error('Erreur de suppression de fichier:', error);
            throw this.handleFirebaseError(error);
        }
    }

    // Statistiques
    async getSessionStats(sessionId) {
        try {
            // Messages count
            const messagesQuery = this.db.collection('messages')
                .where('sessionId', '==', sessionId);
            const messagesCount = (await messagesQuery.count().get()).data().count;
            
            // Files count
            const filesQuery = this.db.collection('shared_files')
                .where('sessionId', '==', sessionId);
            const filesCount = (await filesQuery.count().get()).data().count;
            
            // Durée de session
            const sessionDoc = await this.db.collection('sessions').doc(sessionId).get();
            let duration = 0;
            
            if (sessionDoc.exists) {
                const sessionData = sessionDoc.data();
                if (sessionData.startTime && sessionData.endTime) {
                    duration = sessionData.endTime.toDate() - sessionData.startTime.toDate();
                }
            }
            
            return {
                messages: messagesCount,
                files: filesCount,
                duration: duration
            };

        } catch (error) {
            console.error('Erreur de récupération des statistiques:', error);
            return { messages: 0, files: 0, duration: 0 };
        }
    }

    // Fermer une session
    async closeSession(sessionId) {
        try {
            await this.db.collection('sessions').doc(sessionId).update({
                status: 'closed',
                endTime: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Nettoyer le cache
            this.cache.sessions.delete(sessionId);
            this.cache.messages.clear();
            this.cache.files.clear();
            
            return true;

        } catch (error) {
            console.error('Erreur de fermeture de session:', error);
            throw this.handleFirebaseError(error);
        }
    }

    // Notifications
    async sendNotification(userId, notification) {
        try {
            await this.db.collection('notifications').add({
                userId,
                title: notification.title,
                body: notification.body,
                type: notification.type || 'info',
                data: notification.data || {},
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Envoyer une notification push si demandé
            if (notification.push) {
                await this.sendPushNotification(userId, notification);
            }
            
            return true;
        } catch (error) {
            console.error('Erreur d\'envoi de notification:', error);
            return false;
        }
    }

    async sendPushNotification(userId, notification) {
        try {
            // Récupérer le token FCM de l'utilisateur
            const tokenDoc = await this.db.collection('user_tokens').doc(userId).get();
            
            if (tokenDoc.exists) {
                const tokenData = tokenDoc.data();
                
                // Envoyer la notification via Cloud Functions ou un serveur
                // Cette partie nécessite une Cloud Function Firebase
                console.log('Notification push à envoyer à:', userId);
                // Implémentation dépendante de votre backend
            }
        } catch (error) {
            console.error('Erreur d\'envoi de notification push:', error);
        }
    }

    async getUserNotifications(userId, limit = 10, unreadOnly = false) {
        try {
            let query = this.db.collection('notifications')
                .where('userId', '==', userId);
            
            if (unreadOnly) {
                query = query.where('read', '==', false);
            }
            
            const snapshot = await query
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erreur de récupération des notifications:', error);
            return [];
        }
    }

    async markNotificationAsRead(notificationId) {
        try {
            await this.db.collection('notifications').doc(notificationId).update({
                read: true,
                readAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return true;
        } catch (error) {
            console.error('Erreur de marquage de notification comme lue:', error);
            return false;
        }
    }

    // Nettoyage
    cleanup() {
        // Désabonner tous les listeners
        this.unsubscribeFunctions.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        
        this.unsubscribeFunctions = [];
        this.cache = {
            tutors: null,
            sessions: new Map(),
            messages: new Map(),
            files: new Map()
        };
        
        console.log('FirebaseManager nettoyé');
    }

    // Gestion des erreurs
    handleFirebaseError(error) {
        console.error('Erreur Firebase:', error.code, error.message);
        
        const errorMap = {
            'permission-denied': 'Permission refusée',
            'unauthenticated': 'Non authentifié',
            'not-found': 'Ressource non trouvée',
            'already-exists': 'Existe déjà',
            'resource-exhausted': 'Limite de requêtes atteinte',
            'failed-precondition': 'Condition préalable échouée',
            'aborted': 'Opération annulée',
            'out-of-range': 'Hors limites',
            'unimplemented': 'Non implémenté',
            'internal': 'Erreur interne',
            'unavailable': 'Service indisponible',
            'data-loss': 'Perte de données'
        };
        
        return {
            code: error.code,
            message: errorMap[error.code] || error.message,
            originalError: error
        };
    }

    // Méthodes utilitaires
    async waitForConnection() {
        return new Promise((resolve) => {
            const connectedRef = this.db.ref('.info/connected');
            connectedRef.on('value', (snap) => {
                if (snap.val() === true) {
                    resolve(true);
                }
            });
            
            // Timeout après 10 secondes
            setTimeout(() => resolve(false), 10000);
        });
    }

    getTimestamp() {
        return firebase.firestore.FieldValue.serverTimestamp();
    }

    generateId() {
        return this.db.collection('temp').doc().id;
    }
}

// Singleton pattern
let firebaseManagerInstance = null;

function getFirebaseManager(config = null) {
    if (!firebaseManagerInstance) {
        firebaseManagerInstance = new FirebaseManager(config);
    }
    return firebaseManagerInstance;
}

// Exporter
window.FirebaseManager = FirebaseManager;
window.getFirebaseManager = getFirebaseManager;
window.firebaseManager = getFirebaseManager();