 // Modifier tutoring-room.js
import FirebaseChatService from './firebase-service.js';

class TutoringRoomManager {
    constructor() {
        // ... code existant ...
        this.firebaseService = null;
    }

    async init() {
        // ... code existant ...
        
        // Initialiser Firebase
        this.firebaseService = new FirebaseChatService(this.sessionId);
        
        // Écouter les nouveaux messages
        document.addEventListener('new-message', (event) => {
            this.handleFirebaseMessage(event.detail);
        });
    }

    // Modifier sendMessage
    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;

        const messageData = {
            type: 'text',
            sender: 'student',
            content: message,
            senderName: 'Vous',
            sessionId: this.sessionId
        };

        // Envoyer via Firebase
        await this.firebaseService.sendMessage(messageData);
        
        // Effacer le champ
        chatInput.value = '';
    }

    handleFirebaseMessage(message) {
        // Ne pas afficher les messages que nous venons d'envoyer
        if (message.sender === 'student' && message.senderName === 'Vous') {
            return;
        }

        // Afficher le message
        this.displayMessage({
            id: message.id || Date.now(),
            sender: message.sender,
            name: message.senderName || 'Tuteur',
            time: new Date(message.timestamp?.toDate() || Date.now()).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            content: message.content,
            type: message.type || 'text'
        });
    }

    cleanup() {
        if (this.firebaseService) {
            this.firebaseService.cleanup();
        }
        // ... code existant ...
    }
}

// scripts/tutoring-room.js
// Gestionnaire complet de la salle de tutorat avec Peer.js

class TutoringRoomManager {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.tutor = null;
        this.messages = [];
        this.isAudioMuted = false;
        this.isVideoOff = false;
        this.sessionTimer = null;
        this.sessionSeconds = 0;
        this.peerManager = null;
        this.firebaseManager = null;
        this.chatListener = null;
        this.whiteboardManager = null;
        
        this.init();
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9);
    }

    async init() {
        try {
            // Charger les données de session
            await this.loadSessionData();
            
            // Initialiser l'interface
            this.initializeUI();
            this.setupEventListeners();
            this.startSessionTimer();
            
            // Initialiser Peer.js
            await this.initializePeerConnection();
            
            // Initialiser Firebase (si disponible)
            await this.initializeFirebase();
            
            // Simuler le chargement initial
            this.simulateLoading();
            
            // Afficher le message de bienvenue
            setTimeout(() => {
                if (typeof showNotification === 'function') {
                    showNotification('Session démarrée', `Connecté avec ${this.tutor?.name || 'le tuteur'}`, 'success');
                }
            }, 1500);
            
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            this.showError('Impossible de démarrer la session');
        }
    }

    async loadSessionData() {
        try {
            // Récupérer l'ID du tuteur depuis l'URL
            const urlParams = new URLSearchParams(window.location.search);
            const tutorId = urlParams.get('tutor') || '1';
            
            // Charger les données du tuteur
            if (typeof MockData !== 'undefined' && MockData.getTutorById) {
                this.tutor = MockData.getTutorById(parseInt(tutorId));
            } else {
                // Données par défaut
                this.tutor = {
                    id: 1,
                    name: "Dr. Marie Curie",
                    subject: "physics",
                    subjectName: "Physique",
                    rating: 4.9,
                    avatar: "MC",
                    peerId: "tutor_" + tutorId // ID Peer.js simulé
                };
            }
            
            // Charger les messages initiaux
            if (typeof MockData !== 'undefined' && MockData.chatMessages) {
                this.messages = MockData.chatMessages;
            } else {
                this.messages = this.getDefaultMessages();
            }
            
        } catch (error) {
            console.error('Erreur de chargement des données:', error);
            this.tutor = {
                id: 1,
                name: "Tuteur de démonstration",
                subject: "math",
                subjectName: "Mathématiques",
                rating: 4.5,
                avatar: "TD",
                peerId: "tutor_demo"
            };
            this.messages = this.getDefaultMessages();
        }
    }

    getDefaultMessages() {
        return [
            {
                id: 1,
                sender: "tutor",
                name: "Dr. Marie Curie",
                time: "10:00",
                content: "Bonjour ! Bienvenue dans notre session de tutorat. Comment puis-je vous aider aujourd'hui ?",
                type: "text"
            },
            {
                id: 2,
                sender: "student",
                name: "Vous",
                time: "10:01",
                content: "Bonjour Dr. Curie ! J'ai des difficultés avec les équations du mouvement rectiligne uniforme.",
                type: "text"
            },
            {
                id: 3,
                sender: "tutor",
                name: "Dr. Marie Curie",
                time: "10:02",
                content: "Excellent sujet ! Commençons par la formule de base : v = d/t. Avez-vous des exercices spécifiques ?",
                type: "text"
            }
        ];
    }

    initializeUI() {
        // Mettre à jour les informations du tuteur
        this.updateTutorInfo();
        
        // Afficher les messages
        this.renderMessages();
        
        // Initialiser les contrôles
        this.updateControlStates();
        
        // Simuler l'indicateur de frappe
        this.simulateTyping();
    }

    updateTutorInfo() {
        if (!this.tutor) return;
        
        // Mettre à jour le nom du tuteur
        const tutorNameElements = document.querySelectorAll('#tutor-name, #tutor-name-display');
        tutorNameElements.forEach(el => {
            if (el) el.textContent = this.tutor.name;
        });
        
        // Mettre à jour la matière
        const subjectBadge = document.querySelector('.subject-badge');
        if (subjectBadge && this.tutor.subjectName) {
            subjectBadge.textContent = this.tutor.subjectName;
        }
        
        // Mettre à jour l'avatar
        const tutorAvatar = document.querySelector('.tutor-avatar');
        if (tutorAvatar && this.tutor.avatar) {
            tutorAvatar.textContent = this.tutor.avatar;
        }
    }

    async initializePeerConnection() {
        try {
            // Vérifier si Peer.js est disponible
            if (typeof Peer === 'undefined') {
                console.warn('Peer.js non chargé, utilisation du mode simulation');
                return;
            }
            
            // Initialiser PeerManager
            this.peerManager = new PeerManager();
            
            // Démarrer le flux local
            const localStream = await this.peerManager.startLocalStream();
            
            if (localStream) {
                // Masquer le placeholder étudiant
                const studentPlaceholder = document.getElementById('student-placeholder');
                const studentVideo = document.getElementById('student-video');
                
                if (studentPlaceholder) {
                    studentPlaceholder.style.display = 'none';
                }
                if (studentVideo) {
                    studentVideo.style.display = 'block';
                }
                
                // Se connecter au tuteur
                const tutorPeerId = this.getTutorPeerId();
                if (tutorPeerId) {
                    await this.peerManager.connectToTutor(tutorPeerId);
                }
            }
            
        } catch (error) {
            console.error('Erreur d\'initialisation Peer:', error);
            if (typeof showNotification === 'function') {
                showNotification('Peer.js', 'Connexion P2P non disponible, mode simulation activé', 'warning');
            }
        }
    }

    async initializeFirebase() {
        try {
            // Vérifier si Firebase est disponible
            if (typeof FirebaseManager === 'undefined') {
                return;
            }
            
            this.firebaseManager = new FirebaseManager();
            
            // Créer ou récupérer la session Firebase
            this.firebaseSessionId = await this.createFirebaseSession();
            
            if (this.firebaseSessionId) {
                // Charger les messages depuis Firebase
                await this.loadMessagesFromFirebase();
                
                // Écouter les nouveaux messages
                this.setupFirebaseChatListener();
            }
            
        } catch (error) {
            console.error('Erreur d\'initialisation Firebase:', error);
        }
    }

    async createFirebaseSession() {
        if (!this.firebaseManager || !this.tutor) return null;
        
        try {
            const sessionId = await this.firebaseManager.createSession(
                this.tutor.id.toString(),
                'student_' + Math.random().toString(36).substr(2, 9)
            );
            
            return sessionId;
            
        } catch (error) {
            console.error('Erreur de création de session Firebase:', error);
            return null;
        }
    }

    async loadMessagesFromFirebase() {
        if (!this.firebaseManager || !this.firebaseSessionId) return;
        
        try {
            const messages = await this.firebaseManager.getChatMessages(this.firebaseSessionId);
            
            if (messages.length > 0) {
                this.messages = messages.map(msg => ({
                    id: msg.id,
                    sender: msg.sender,
                    name: msg.name,
                    time: new Date(msg.timestamp?.toDate()).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    content: msg.content,
                    type: msg.type || 'text'
                }));
                
                this.renderMessages();
            }
            
        } catch (error) {
            console.error('Erreur de chargement des messages Firebase:', error);
        }
    }

    setupFirebaseChatListener() {
        if (!this.firebaseManager || !this.firebaseSessionId) return;
        
        try {
            this.chatListener = this.firebaseManager.setupChatListener(
                this.firebaseSessionId,
                (message) => {
                    // Formater le nouveau message
                    const formattedMessage = {
                        id: message.id,
                        sender: message.sender,
                        name: message.name,
                        time: new Date(message.timestamp?.toDate()).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        }),
                        content: message.content,
                        type: message.type || 'text'
                    };
                    
                    // Vérifier si le message n'existe pas déjà
                    const existingMessage = this.messages.find(m => m.id === formattedMessage.id);
                    if (!existingMessage) {
                        this.messages.push(formattedMessage);
                        this.renderMessage(formattedMessage);
                        this.scrollChatToBottom();
                    }
                }
            );
            
        } catch (error) {
            console.error('Erreur de configuration du listener Firebase:', error);
        }
    }

    getTutorPeerId() {
        // Récupérer l'ID Peer du tuteur depuis différentes sources
        const urlParams = new URLSearchParams(window.location.search);
        
        // 1. Depuis l'URL
        const peerIdFromUrl = urlParams.get('peerId');
        if (peerIdFromUrl) return peerIdFromUrl;
        
        // 2. Depuis les données du tuteur
        if (this.tutor && this.tutor.peerId) {
            return this.tutor.peerId;
        }
        
        // 3. ID par défaut pour la démo
        return 'tutor_demo';
    }

    setupEventListeners() {
        // Boutons audio/vidéo
        const audioBtn = document.getElementById('toggle-audio');
        const videoBtn = document.getElementById('toggle-video');
        const audioToolBtn = document.getElementById('toggle-audio-btn');
        const videoToolBtn = document.getElementById('toggle-video-btn');
        
        if (audioBtn) audioBtn.addEventListener('click', () => this.toggleAudio());
        if (videoBtn) videoBtn.addEventListener('click', () => this.toggleVideo());
        if (audioToolBtn) audioToolBtn.addEventListener('click', () => this.toggleAudio());
        if (videoToolBtn) videoToolBtn.addEventListener('click', () => this.toggleVideo());
        
        // Envoi de message
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Partage d'écran
        const shareScreenBtn = document.getElementById('share-screen-btn');
        if (shareScreenBtn) {
            shareScreenBtn.addEventListener('click', () => this.shareScreen());
        }
        
        // Enregistrement
        const recordBtn = document.getElementById('record-btn');
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.toggleRecording());
        }
        
        // Quitter la session
        const leaveBtn = document.getElementById('leave-session');
        if (leaveBtn) {
            leaveBtn.addEventListener('click', () => this.leaveSession());
        }
        
        // Tableau blanc
        const whiteboardBtn = document.getElementById('open-whiteboard');
        if (whiteboardBtn) {
            whiteboardBtn.addEventListener('click', () => this.openWhiteboard());
        }
        
        // Gestion de la fermeture de la page
        window.addEventListener('beforeunload', (e) => {
            this.cleanup();
        });
    }

    toggleAudio() {
        this.isAudioMuted = !this.isAudioMuted;
        
        // Mettre à jour PeerManager si disponible
        if (this.peerManager) {
            this.peerManager.toggleAudio(!this.isAudioMuted);
        }
        
        // Mettre à jour l'interface
        const audioBtns = document.querySelectorAll('#toggle-audio, #toggle-audio-btn');
        audioBtns.forEach(btn => {
            if (btn) {
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = this.isAudioMuted ? 'fas fa-microphone-slash' : 'fas fa-microphone';
                }
                btn.classList.toggle('muted', this.isAudioMuted);
            }
        });
        
        // Notification
        const status = this.isAudioMuted ? 'désactivé' : 'activé';
        if (typeof showNotification === 'function') {
            showNotification('Audio ' + status, 'Votre microphone est ' + status, 'info');
        }
    }

    toggleVideo() {
        this.isVideoOff = !this.isVideoOff;
        
        // Mettre à jour PeerManager si disponible
        if (this.peerManager) {
            this.peerManager.toggleVideo(!this.isVideoOff);
        }
        
        // Mettre à jour l'interface
        const videoBtns = document.querySelectorAll('#toggle-video, #toggle-video-btn');
        videoBtns.forEach(btn => {
            if (btn) {
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = this.isVideoOff ? 'fas fa-video-slash' : 'fas fa-video';
                }
                btn.classList.toggle('muted', this.isVideoOff);
            }
        });
        
      // scripts/tutoring-room.js
// Gestionnaire complet de la salle de tutorat

class TutoringRoomManager {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.tutor = null;
        this.messages = [];
        this.isAudioMuted = false;
        this.isVideoOff = false;
        this.sessionTimer = null;
        this.sessionSeconds = 0;

        this.peerManager = null;
        this.firebaseManager = null;
        this.firebaseSessionId = null;
        this.chatListener = null;
        this.whiteboardManager = null;

        this.init();
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9);
    }

    /* =============================
       INITIALISATION
    ============================== */
    async init() {
        try {
            await this.loadSessionData();
            this.initializeUI();
            this.setupEventListeners();
            this.startSessionTimer();
            await this.initializePeerConnection();
            await this.initializeFirebase();
            this.simulateLoading();

            setTimeout(() => {
                if (typeof showNotification === 'function') {
                    showNotification(
                        'Session démarrée',
                        `Connecté avec ${this.tutor?.name || 'le tuteur'}`,
                        'success'
                    );
                }
            }, 1500);

        } catch (error) {
            console.error(error);
            this.showError('Impossible de démarrer la session');
        }
    }

    async loadSessionData() {
        const urlParams = new URLSearchParams(window.location.search);
        const tutorId = urlParams.get('tutor') || '1';

        if (typeof MockData !== 'undefined' && MockData.getTutorById) {
            this.tutor = MockData.getTutorById(parseInt(tutorId));
        } else {
            this.tutor = {
                id: tutorId,
                name: "Dr. Marie Curie",
                subjectName: "Physique",
                avatar: "MC",
                peerId: "tutor_" + tutorId
            };
        }

        this.messages = this.getDefaultMessages();
    }

    getDefaultMessages() {
        return [
            {
                id: 1,
                sender: "tutor",
                name: "Dr. Marie Curie",
                time: "10:00",
                content: "Bonjour ! Comment puis-je vous aider ?",
                type: "text"
            }
        ];
    }

    /* =============================
       UI
    ============================== */
    initializeUI() {
        this.updateTutorInfo();
        this.renderMessages();
        this.updateControlStates();
        this.simulateTyping();
    }

    updateTutorInfo() {
        document.querySelectorAll('#tutor-name, #tutor-name-display')
            .forEach(el => el && (el.textContent = this.tutor.name));

        const badge = document.querySelector('.subject-badge');
        if (badge) badge.textContent = this.tutor.subjectName;

        const avatar = document.querySelector('.tutor-avatar');
        if (avatar) avatar.textContent = this.tutor.avatar;
    }

    /* =============================
       PEER.JS
    ============================== */
    async initializePeerConnection() {
        if (typeof Peer === 'undefined') return;

        this.peerManager = new PeerManager();
        const stream = await this.peerManager.startLocalStream();
        if (!stream) return;

        const tutorPeerId = this.tutor.peerId;
        if (tutorPeerId) {
            await this.peerManager.connectToTutor(tutorPeerId);
        }
    }

    /* =============================
       FIREBASE
    ============================== */
    async initializeFirebase() {
        if (typeof FirebaseManager === 'undefined') return;

        this.firebaseManager = new FirebaseManager();

        this.firebaseSessionId = await this.firebaseManager.createSession(
            this.tutor.id.toString(),
            'student_' + Math.random().toString(36).substr(2, 9)
        );

        if (!this.firebaseSessionId) return;

        const messages = await this.firebaseManager.getChatMessages(this.firebaseSessionId);
        if (messages.length) {
            this.messages = messages.map(m => this.formatFirebaseMessage(m));
            this.renderMessages();
        }

        this.chatListener = this.firebaseManager.setupChatListener(
            this.firebaseSessionId,
            (message) => this.handleIncomingMessage(message)
        );
    }

    formatFirebaseMessage(message) {
        return {
            id: message.id,
            sender: message.sender,
            name: message.name,
            time: new Date(message.timestamp?.toDate()).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            content: message.content,
            type: message.type || 'text'
        };
    }

    handleIncomingMessage(message) {
        if (this.messages.some(m => m.id === message.id)) return;
        const formatted = this.formatFirebaseMessage(message);
        this.messages.push(formatted);
        this.renderMessage(formatted);
        this.scrollChatToBottom();
    }

    /* =============================
       CHAT
    ============================== */
    async sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input || !input.value.trim()) return;

        const message = {
            id: Date.now().toString(),
            sender: "student",
            name: "Vous",
            content: input.value.trim(),
            type: "text",
            timestamp: new Date()
        };

        if (this.peerManager) {
            this.peerManager.sendMessage('chat_message', message);
        }

        if (this.firebaseManager && this.firebaseSessionId) {
            await this.firebaseManager.sendChatMessage(this.firebaseSessionId, message);
        } else {
            this.addMessageLocally(message);
            this.simulateTutorResponse();
        }

        input.value = '';
        this.scrollChatToBottom();
    }

    addMessageLocally(message) {
        const local = {
            ...message,
            time: new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        this.messages.push(local);
        this.renderMessage(local);
    }

    renderMessages() {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        container.innerHTML = '';
        this.messages.forEach(m => this.renderMessage(m));
        this.scrollChatToBottom();
    }

    renderMessage(message) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const div = document.createElement('div');
        div.className = `message ${message.sender}-message`;
        div.innerHTML = `
            <div class="message-header">
                <strong>${message.name}</strong> • ${message.time}
            </div>
            <div class="message-content">${message.content}</div>
        `;
        container.appendChild(div);
    }

    /* =============================
       UTILITAIRES
    ============================== */
    setupEventListeners() {
        document.getElementById('send-btn')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input')?.addEventListener('keypress', e => {
            if (e.key === 'Enter') this.sendMessage();
        });

        window.addEventListener('beforeunload', () => this.cleanup());
    }

    scrollChatToBottom() {
        const el = document.getElementById('chat-messages');
        if (el) el.scrollTop = el.scrollHeight;
    }

    simulateTutorResponse() {
        setTimeout(() => {
            this.addMessageLocally({
                id: Date.now() + 1,
                sender: "tutor",
                name: this.tutor.name,
                content: "Très bonne question, regardons cela ensemble.",
                type: "text",
                timestamp: new Date()
            });
        }, 2000);
    }

    simulateTyping() {
        setInterval(() => {
            const indicator = document.getElementById('typing-indicator');
            if (!indicator) return;
            indicator.style.display = 'flex';
            setTimeout(() => indicator.style.display = 'none', 1500);
        }, 12000);
    }

    startSessionTimer() {
        const el = document.getElementById('session-timer');
        if (!el) return;

        this.sessionTimer = setInterval(() => {
            this.sessionSeconds++;
            const m = Math.floor(this.sessionSeconds / 60);
            const s = this.sessionSeconds % 60;
            el.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }, 1000);
    }

    cleanup() {
        if (this.sessionTimer) clearInterval(this.sessionTimer);
        if (this.peerManager) this.peerManager.disconnect();
        if (this.chatListener) this.chatListener();
        if (this.firebaseManager && this.firebaseSessionId) {
            this.firebaseManager.closeSession(this.firebaseSessionId);
        }
        if (this.whiteboardManager) this.whiteboardManager.close();
    }

    showError(message) {
        document.querySelector('main').innerHTML = `<p>${message}</p>`;
    }
}

/* =============================
   BOOTSTRAP
============================== */
document.addEventListener('DOMContentLoaded', () => {
    window.tutoringRoomManager = new TutoringRoomManager();
}); 
}
}