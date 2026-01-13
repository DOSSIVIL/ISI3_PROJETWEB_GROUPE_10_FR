// Créer: scripts/firebase-service.js
import { db, auth, collection, addDoc, query, orderBy, onSnapshot, Timestamp, signInAnonymously } from './firebase-config.js';

class FirebaseChatService {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.messagesRef = collection(db, 'sessions', sessionId, 'messages');
        this.unsubscribe = null;
        this.init();
    }

    async init() {
        try {
            // Connexion anonyme
            await signInAnonymously(auth);
            
            // Écouter les nouveaux messages
            this.setupMessageListener();
            
        } catch (error) {
            console.error('Erreur Firebase:', error);
        }
    }

    setupMessageListener() {
        const q = query(this.messagesRef, orderBy('timestamp', 'asc'));
        
        this.unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const message = change.doc.data();
                    this.handleNewMessage(message);
                }
            });
        });
    }

    async sendMessage(messageData) {
        try {
            const message = {
                ...messageData,
                timestamp: Timestamp.now(),
                sessionId: this.sessionId
            };

            await addDoc(this.messagesRef, message);
            
        } catch (error) {
            console.error('Erreur envoi message:', error);
            throw error;
        }
    }

    handleNewMessage(message) {
        // Émettre un événement ou appeler un callback
        const event = new CustomEvent('new-message', { detail: message });
        document.dispatchEvent(event);
    }

    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

export default FirebaseChatService;