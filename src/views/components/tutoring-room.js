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
        
        // Afficher/masquer le placeholder vidéo
        const studentPlaceholder = document.getElementById('student-placeholder');
        const studentVideo = document.getElementById('student-video');
        
        if (studentPlaceholder) {
            studentPlaceholder.style.display = this.isVideoOff ? 'flex' : 'none';
        }
        if (studentVideo) {
            studentVideo.style.display = this.isVideoOff ? 'none' : 'block';
        }
        
        // Notification
        const status = this.isVideoOff ? 'désactivée' : 'activée';
        if (typeof showNotification === 'function') {
            showNotification('Vidéo ' + status, 'Votre caméra est ' + status, 'info');
        }
    }

    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;
        
        const messageContent = chatInput.value.trim();
        if (!messageContent) return;
        
        // Créer l'objet message
        const messageData = {
            id: Date.now().toString(),
            sender: "student",
            name: "Vous",
            content: messageContent,
            type: "text",
            timestamp: new Date()
        };
        
        // 1. Envoyer via Peer.js (P2P)
        if (this.peerManager) {
            this.peerManager.sendMessage('chat_message', {
                content: messageContent,
                sender: 'student',
                timestamp: Date.now()
            });
        }
        
        // 2. Envoyer via Firebase
        if (this.firebaseManager && this.firebaseSessionId) {
            try {
                await this.firebaseManager.sendChatMessage(this.firebaseSessionId, messageData);
            } catch (error) {
                console.error('Erreur d\'envoi Firebase:', error);
                // Fallback local
                this.addMessageLocally(messageData);
            }
        } else {
            // 3. Fallback local
            this.addMessageLocally(messageData);
            this.simulateTutorResponse();
        }
        
        // Effacer le champ de saisie
        chatInput.value = '';
        this.scrollChatToBottom();
    }

    addMessageLocally(messageData) {
        // Formater le message pour l'affichage local
        const localMessage = {
            ...messageData,
            time: new Date(messageData.timestamp).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
        
        this.messages.push(localMessage);
        this.renderMessage(localMessage);
    }

    renderMessages() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        // Effacer les messages existants
        chatMessages.innerHTML = '';
        
        // Afficher tous les messages
        this.messages.forEach(message => {
            this.renderMessage(message);
        });
        
        // Faire défiler vers le bas
        this.scrollChatToBottom();
    }

    renderMessage(message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageClass = message.sender === 'tutor' ? 'tutor-message' : 
                           message.sender === 'student' ? 'student-message' : 'system-message';
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${messageClass}`;
        messageElement.innerHTML = `
            <div class="message-header">
                <strong>${message.name}</strong> • ${message.time}
            </div>
            <div class="message-content">
                ${message.content}
            </div>
        `;
        
        chatMessages.appendChild(messageElement);
    }

    simulateTutorResponse() {
        // Afficher l'indicateur de frappe
        this.showTypingIndicator();
        
        // Réponse après un délai
        setTimeout(() => {
            this.hideTypingIndicator();
            
            const responses = [
                "Je vois. Pouvez-vous me montrer l'exercice sur lequel vous bloquez ?",
                "C'est une bonne question. Laissez-moi vous expliquer cela plus en détail.",
                "Je comprends votre difficulté. Souhaitez-vous que nous reprenions depuis le début ?",
                "Très bien. J'ai noté votre question. Continuons avec l'explication.",
                "Excellent point ! Cela mérite une démonstration étape par étape."
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            const tutorMessage = {
                id: Date.now() + 1,
                sender: "tutor",
                name: this.tutor?.name || "Tuteur",
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                content: randomResponse,
                type: "text",
                timestamp: new Date()
            };
            
            // Envoyer via Peer.js si disponible
            if (this.peerManager) {
                this.peerManager.sendMessage('chat_message', {
                    content: randomResponse,
                    sender: 'tutor',
                    timestamp: Date.now()
                });
            }
            
            // Envoyer via Firebase si disponible
            if (this.firebaseManager && this.firebaseSessionId) {
                this.firebaseManager.sendChatMessage(this.firebaseSessionId, tutorMessage);
            } else {
                // Fallback local
                this.addMessageLocally(tutorMessage);
            }
            
        }, 2000 + Math.random() * 2000);
    }

    showTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
        }
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    simulateTyping() {
        // Simuler occasionnellement que le tuteur tape
        setInterval(() => {
            if (Math.random() < 0.3 && !document.getElementById('typing-indicator')?.style.display) {
                this.showTypingIndicator();
                setTimeout(() => this.hideTypingIndicator(), 1500 + Math.random() * 2000);
            }
        }, 10000);
    }

    scrollChatToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    shareScreen() {
        if (this.peerManager) {
            this.peerManager.shareScreen();
        } else {
            if (typeof showNotification === 'function') {
                showNotification('Partage d\'écran', 'Nécessite l\'intégration de Peer.js', 'info');
            }
        }
    }

    toggleRecording() {
        const recordBtn = document.getElementById('record-btn');
        if (!recordBtn) return;
        
        const isRecording = recordBtn.classList.contains('recording');
        
        if (isRecording) {
            // Arrêter l'enregistrement
            recordBtn.classList.remove('recording');
            const icon = recordBtn.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-circle';
            }
            
            if (typeof showNotification === 'function') {
                showNotification('Enregistrement arrêté', 'La session a été enregistrée', 'success');
            }
        } else {
            // Démarrer l'enregistrement
            recordBtn.classList.add('recording');
            const icon = recordBtn.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-stop';
            }
            
            if (typeof showNotification === 'function') {
                showNotification('Enregistrement démarré', 'La session est en cours d\'enregistrement', 'success');
            }
        }
    }

    leaveSession() {
        if (confirm('Êtes-vous sûr de vouloir quitter la session ?')) {
            // Nettoyer les ressources
            this.cleanup();
            
            // Redirection
            setTimeout(() => {
                window.location.href = 'tutor-list.html';
            }, 1000);
        }
    }

    openWhiteboard() {
        // Initialiser le tableau blanc si ce n'est pas déjà fait
        if (!this.whiteboardManager && typeof WhiteboardManager !== 'undefined') {
            this.whiteboardManager = new WhiteboardManager();
        }
        
        if (this.whiteboardManager) {
            this.whiteboardManager.open();
        } else {
            if (typeof showNotification === 'function') {
                showNotification('Tableau blanc', 'Fonctionnalité à implémenter avec Canvas API', 'info');
            }
        }
    }

    startSessionTimer() {
        const timerElement = document.getElementById('session-timer');
        if (!timerElement) return;
        
        this.sessionTimer = setInterval(() => {
            this.sessionSeconds++;
            
            const hours = Math.floor(this.sessionSeconds / 3600);
            const minutes = Math.floor((this.sessionSeconds % 3600) / 60);
            const seconds = this.sessionSeconds % 60;
            
            timerElement.textContent = 
                `${hours.toString().padStart(2, '0')}:` +
                `${minutes.toString().padStart(2, '0')}:` +
                `${seconds.toString().padStart(2, '0')}`;
                
        }, 1000);
    }

    simulateLoading() {
        const videoLoading = document.getElementById('video-loading');
        const tutorPlaceholder = document.getElementById('tutor-placeholder');
        
        if (videoLoading && tutorPlaceholder) {
            // Masquer le chargement après délai
            setTimeout(() => {
                if (videoLoading) {
                    videoLoading.style.display = 'none';
                }
                if (tutorPlaceholder) {
                    tutorPlaceholder.style.display = 'flex';
                }
                
                // Simuler la connexion vidéo
                setTimeout(() => {
                    if (typeof showNotification === 'function') {
                        showNotification('Prêt pour la connexion', 'Appuyez sur "Rejoindre la session" pour démarrer', 'info');
                    }
                }, 1000);
                
            }, 2000);
        }
    }

    updateControlStates() {
        // Mettre à jour les états des boutons audio/vidéo
        const audioBtns = document.querySelectorAll('#toggle-audio, #toggle-audio-btn');
        const videoBtns = document.querySelectorAll('#toggle-video, #toggle-video-btn');
        
        audioBtns.forEach(btn => {
            if (btn) {
                btn.classList.toggle('muted', this.isAudioMuted);
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = this.isAudioMuted ? 'fas fa-microphone-slash' : 'fas fa-microphone';
                }
            }
        });
        
        videoBtns.forEach(btn => {
            if (btn) {
                btn.classList.toggle('muted', this.isVideoOff);
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = this.isVideoOff ? 'fas fa-video-slash' : 'fas fa-video';
                }
            }
        });
    }

    showError(message) {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">Erreur de session</h3>
                    <p class="text-gray-300 mb-4">${message}</p>
                    <div class="flex justify-center gap-4">
                        <button onclick="window.location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-redo mr-2"></i>Réessayer
                        </button>
                        <button onclick="window.location.href='tutor-list.html'" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            <i class="fas fa-arrow-left mr-2"></i>Retour aux tuteurs
                        </button>
                    </div>
                </div>
            `;
        }
    }

    cleanup() {
        // Arrêter le timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
        }
        
        // Fermer les connexions Peer.js
        if (this.peerManager) {
            this.peerManager.disconnect();
        }
        
        // Fermer les listeners Firebase
        if (this.chatListener) {
            this.chatListener();
        }
        
        // Fermer la session Firebase
        if (this.firebaseManager && this.firebaseSessionId) {
            this.firebaseManager.closeSession(this.firebaseSessionId);
        }
        
        // Fermer le tableau blanc
        if (this.whiteboardManager) {
            this.whiteboardManager.close();
        }
    }
}

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.tutoringRoomManager = new TutoringRoomManager();
});