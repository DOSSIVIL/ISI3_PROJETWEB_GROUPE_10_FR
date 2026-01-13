// scripts/peer-manager.js
// Gestionnaire Peer.js pour les connexions P2P

class PeerManager {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.call = null;
        this.localStream = null;
        this.remoteStream = null;
        this.peerId = null;
        this.tutorPeerId = null;
        
        this.init();
    }

    async init() {
        try {
            // Vérifier si Peer.js est disponible
            if (typeof Peer === 'undefined') {
                console.warn('Peer.js library not loaded');
                this.showNotification('Peer.js non chargé', 'Les fonctionnalités P2P sont désactivées', 'warning');
                return;
            }
            
            // Générer un ID unique pour cet étudiant
            this.peerId = 'student_' + this.generateStudentId();
            
            // Initialiser Peer avec configuration
            this.peer = new Peer(this.peerId, {
                host: '0.peerjs.com',
                port: 443,
                path: '/',
                debug: 2,
                config: {
                    'iceServers': [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478' }
                    ]
                }
            });
            
            // Événements Peer
            this.setupPeerEvents();
            
            // Démarrer le flux média local
            await this.startLocalMedia();
            
        } catch (error) {
            console.error('Erreur d\'initialisation PeerManager:', error);
            this.showNotification('Erreur Peer.js', 'Impossible d\'initialiser la connexion P2P', 'error');
        }
    }

    generateStudentId() {
        // Générer un ID court et lisible
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    setupPeerEvents() {
        if (!this.peer) return;
        
        // Peer ouvert et prêt
        this.peer.on('open', (id) => {
            console.log('✅ Peer connecté avec ID:', id);
            this.peerId = id;
            this.showNotification('Réseau P2P', 'Connecté au réseau pair-à-pair', 'success');
            
            // Émettre un événement pour informer que Peer est prêt
            this.emitPeerReady();
        });
        
        // Connexion entrante (pour les données)
        this.peer.on('connection', (conn) => {
            console.log('📡 Connexion entrante reçue');
            this.handleIncomingConnection(conn);
        });
        
        // Appel entrant (pour média)
        this.peer.on('call', (incomingCall) => {
            console.log('📞 Appel entrant reçu');
            this.handleIncomingCall(incomingCall);
        });
        
        // Erreurs
        this.peer.on('error', (err) => {
            console.error('❌ Erreur Peer:', err);
            
            let message = 'Erreur de connexion P2P';
            if (err.type === 'peer-unavailable') {
                message = 'Tuteur non disponible';
            } else if (err.type === 'network') {
                message = 'Problème réseau';
            }
            
            this.showNotification('Erreur Peer.js', message, 'error');
        });
        
        // Fermeture
        this.peer.on('close', () => {
            console.log('🔒 Connexion Peer fermée');
            this.showNotification('Déconnexion', 'Connexion P2P terminée', 'warning');
        });
        
        // Déconnexion
        this.peer.on('disconnected', () => {
            console.log('🔌 Peer déconnecté');
            this.showNotification('Déconnexion', 'Perte de connexion au réseau P2P', 'warning');
            
            // Tentative de reconnexion
            setTimeout(() => {
                if (this.peer && this.peer.disconnected) {
                    this.peer.reconnect();
                }
            }, 5000);
        });
    }

    emitPeerReady() {
        // Émettre un événement personnalisé
        const event = new CustomEvent('peer:ready', { 
            detail: { peerId: this.peerId }
        });
        window.dispatchEvent(event);
    }

    async startLocalMedia() {
        try {
            // Demander l'accès aux périphériques média
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            // Afficher le flux local
            this.displayLocalStream();
            
            console.log('🎥 Flux média local obtenu');
            return this.localStream;
            
        } catch (error) {
            console.error('Erreur d\'accès aux médias:', error);
            
            let message = 'Impossible d\'accéder à la caméra/microphone';
            if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                message = 'Périphérique média non trouvé';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                message = 'Périphérique déjà utilisé';
            } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                message = 'Permission refusée';
            } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                message = 'Configuration média non supportée';
            }
            
            this.showNotification('Erreur média', message, 'error');
            return null;
        }
    }

    displayLocalStream() {
        const studentVideo = document.getElementById('student-video');
        const studentPlaceholder = document.getElementById('student-placeholder');
        
        if (studentVideo && this.localStream) {
            studentVideo.srcObject = this.localStream;
            studentVideo.style.display = 'block';
            
            // Masquer le placeholder
            if (studentPlaceholder) {
                studentPlaceholder.style.display = 'none';
            }
        }
    }

    async connectToTutor(tutorPeerId) {
        if (!this.peer || !this.localStream) {
            console.warn('Peer non initialisé ou flux local non disponible');
            return false;
        }
        
        try {
            this.tutorPeerId = tutorPeerId;
            
            // 1. Établir une connexion de données
            this.connection = this.peer.connect(tutorPeerId, {
                reliable: true,
                serialization: 'json'
            });
            
            this.setupDataConnection();
            
            // 2. Initier un appel média
            this.call = this.peer.call(tutorPeerId, this.localStream);
            this.setupMediaCall();
            
            console.log(`🔗 Tentative de connexion au tuteur: ${tutorPeerId}`);
            this.showNotification('Connexion', 'Connexion au tuteur en cours...', 'info');
            
            return true;
            
        } catch (error) {
            console.error('Erreur de connexion au tuteur:', error);
            this.showNotification('Connexion échouée', 'Impossible de joindre le tuteur', 'error');
            return false;
        }
    }

    setupDataConnection() {
        if (!this.connection) return;
        
        this.connection.on('open', () => {
            console.log('✅ Connexion données établie');
            this.showNotification('Chat', 'Connexion chat établie', 'success');
            
            // Envoyer un message de présentation
            this.sendData({
                type: 'student_joined',
                data: {
                    studentId: this.peerId,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent
                }
            });
        });
        
        this.connection.on('data', (data) => {
            console.log('📨 Données reçues:', data);
            this.handleIncomingData(data);
        });
        
        this.connection.on('close', () => {
            console.log('📡 Connexion données fermée');
            this.showNotification('Chat', 'Connexion chat perdue', 'warning');
        });
        
        this.connection.on('error', (err) => {
            console.error('❌ Erreur connexion données:', err);
        });
    }

    setupMediaCall() {
        if (!this.call) return;
        
        this.call.on('stream', (remoteStream) => {
            console.log('🎥 Flux distant reçu');
            this.handleRemoteStream(remoteStream);
        });
        
        this.call.on('close', () => {
            console.log('📞 Appel terminé');
            this.showNotification('Appel', 'Appel vidéo terminé', 'warning');
            this.cleanupRemoteStream();
        });
        
        this.call.on('error', (err) => {
            console.error('❌ Erreur d\'appel:', err);
            this.showNotification('Erreur appel', 'Problème avec l\'appel vidéo', 'error');
        });
    }

    handleIncomingConnection(conn) {
        console.log('Connexion entrante:', conn.peer);
        
        conn.on('data', (data) => {
            this.handleIncomingData(data);
        });
        
        // Répondre à l'appel si nécessaire
        if (this.localStream) {
            conn.on('call', (call) => {
                call.answer(this.localStream);
                this.setupMediaCall();
            });
        }
    }

    handleIncomingCall(incomingCall) {
        if (this.localStream) {
            // Répondre à l'appel avec notre flux local
            incomingCall.answer(this.localStream);
            
            incomingCall.on('stream', (remoteStream) => {
                this.handleRemoteStream(remoteStream);
            });
            
            this.call = incomingCall;
            this.setupMediaCall();
            
            console.log('✅ Appel entrant accepté');
            this.showNotification('Appel', 'Appel du tuteur accepté', 'success');
        } else {
            console.warn('Pas de flux local pour répondre à l\'appel');
            incomingCall.close();
        }
    }

    handleRemoteStream(remoteStream) {
        this.remoteStream = remoteStream;
        
        // Afficher le flux du tuteur
        const tutorVideo = document.getElementById('tutor-video');
        const tutorPlaceholder = document.getElementById('tutor-placeholder');
        const videoLoading = document.getElementById('video-loading');
        
        if (tutorVideo) {
            tutorVideo.srcObject = remoteStream;
            tutorVideo.style.display = 'block';
            
            // Événements de lecture
            tutorVideo.onloadedmetadata = () => {
                console.log('✅ Métadonnées vidéo chargées');
                tutorVideo.play().catch(e => console.error('Erreur de lecture:', e));
            };
            
            tutorVideo.onplay = () => {
                console.log('▶️ Vidéo en lecture');
                this.showNotification('Vidéo', 'Connexion vidéo établie', 'success');
            };
        }
        
        // Masquer les placeholders
        if (tutorPlaceholder) {
            tutorPlaceholder.style.display = 'none';
        }
        
        if (videoLoading) {
            videoLoading.style.display = 'none';
        }
        
        // Surveiller la qualité du flux
        this.monitorStreamQuality(remoteStream);
    }

    monitorStreamQuality(stream) {
        // Simple monitoring de la qualité
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        
        if (videoTrack) {
            const settings = videoTrack.getSettings();
            console.log('📊 Qualité vidéo:', {
                width: settings.width,
                height: settings.height,
                frameRate: settings.frameRate
            });
        }
        
        if (audioTrack) {
            console.log('🎧 Audio activé:', !audioTrack.muted);
        }
    }

    handleIncomingData(data) {
        try {
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }
            
            switch(data.type) {
                case 'chat_message':
                    this.handleChatMessage(data.data);
                    break;
                    
                case 'whiteboard_data':
                    this.handleWhiteboardData(data.data);
                    break;
                    
                case 'file_shared':
                    this.handleFileShared(data.data);
                    break;
                    
                case 'session_control':
                    this.handleSessionControl(data.data);
                    break;
                    
                case 'ping':
                    // Répondre au ping
                    this.sendData({
                        type: 'pong',
                        data: { timestamp: Date.now() }
                    });
                    break;
                    
                default:
                    console.log('Données non traitées:', data);
            }
            
        } catch (error) {
            console.error('Erreur de traitement des données:', error);
        }
    }

    handleChatMessage(messageData) {
        console.log('💬 Message chat reçu:', messageData);
        
        // Émettre un événement pour le chat
        const event = new CustomEvent('peer:chat_message', {
            detail: {
                id: Date.now(),
                sender: 'tutor',
                name: 'Tuteur',
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                content: messageData.content || messageData.text,
                type: 'text',
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }

    handleWhiteboardData(whiteboardData) {
        console.log('🎨 Données tableau blanc reçues');
        
        // Émettre un événement pour le tableau blanc
        const event = new CustomEvent('peer:whiteboard_data', {
            detail: whiteboardData
        });
        window.dispatchEvent(event);
    }

    handleFileShared(fileData) {
        console.log('📎 Fichier partagé reçu:', fileData);
        
        // Émettre un événement pour les fichiers
        const event = new CustomEvent('peer:file_shared', {
            detail: fileData
        });
        window.dispatchEvent(event);
    }

    handleSessionControl(controlData) {
        console.log('🎛️ Contrôle session reçu:', controlData);
        
        switch(controlData.action) {
            case 'mute_student':
                this.toggleAudio(false);
                break;
                
            case 'unmute_student':
                this.toggleAudio(true);
                break;
                
            case 'end_session':
                this.showNotification('Session', 'Le tuteur a terminé la session', 'warning');
                setTimeout(() => {
                    window.location.href = 'tutor-list.html';
                }, 3000);
                break;
                
            case 'request_screen_share':
                this.showNotification('Partage', 'Le tuteur demande le partage d\'écran', 'info');
                break;
        }
    }

    sendData(data) {
        if (this.connection && this.connection.open) {
            try {
                this.connection.send(data);
                return true;
            } catch (error) {
                console.error('Erreur d\'envoi des données:', error);
                return false;
            }
        } else {
            console.warn('Connexion non disponible pour l\'envoi');
            return false;
        }
    }

    sendChatMessage(message) {
        return this.sendData({
            type: 'chat_message',
            data: {
                content: message,
                sender: 'student',
                timestamp: Date.now(),
                messageId: 'msg_' + Date.now()
            }
        });
    }

    sendWhiteboardData(data) {
        return this.sendData({
            type: 'whiteboard_data',
            data: {
                ...data,
                sender: this.peerId,
                timestamp: Date.now()
            }
        });
    }

    toggleAudio(enabled) {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = enabled;
                console.log('🎤 Audio', enabled ? 'activé' : 'désactivé');
                
                // Informer le tuteur
                this.sendData({
                    type: 'audio_state',
                    data: { enabled, studentId: this.peerId }
                });
                
                return true;
            }
        }
        return false;
    }

    toggleVideo(enabled) {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = enabled;
                console.log('📹 Vidéo', enabled ? 'activée' : 'désactivée');
                
                // Mettre à jour l'affichage local
                const studentVideo = document.getElementById('student-video');
                const studentPlaceholder = document.getElementById('student-placeholder');
                
                if (studentVideo) {
                    studentVideo.style.display = enabled ? 'block' : 'none';
                }
                if (studentPlaceholder) {
                    studentPlaceholder.style.display = enabled ? 'none' : 'flex';
                }
                
                // Informer le tuteur
                this.sendData({
                    type: 'video_state',
                    data: { enabled, studentId: this.peerId }
                });
                
                return true;
            }
        }
        return false;
    }

    async shareScreen() {
        try {
            // Demander le partage d'écran
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });
            
            // Remplacer la piste vidéo dans le flux local
            if (this.localStream && this.call) {
                const screenVideoTrack = screenStream.getVideoTracks()[0];
                const localVideoTrack = this.localStream.getVideoTracks()[0];
                
                if (localVideoTrack) {
                    // Remplacer la piste dans le flux local
                    this.localStream.removeTrack(localVideoTrack);
                    this.localStream.addTrack(screenVideoTrack);
                    
                    // Mettre à jour l'appel Peer
                    this.call.peerConnection.getSenders().forEach(sender => {
                        if (sender.track && sender.track.kind === 'video') {
                            sender.replaceTrack(screenVideoTrack);
                        }
                    });
                    
                    // Mettre à jour l'affichage local
                    const studentVideo = document.getElementById('student-video');
                    if (studentVideo) {
                        studentVideo.srcObject = this.localStream;
                    }
                    
                    console.log('🖥️ Partage d\'écran activé');
                    this.showNotification('Partage d\'écran', 'Votre écran est partagé', 'success');
                    
                    // Surveiller l'arrêt du partage
                    screenVideoTrack.onended = () => {
                        console.log('Partage d\'écran arrêté');
                        this.showNotification('Partage d\'écran', 'Partage terminé', 'info');
                        // Revenir à la webcam
                        this.toggleVideo(true);
                    };
                    
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('Erreur de partage d\'écran:', error);
            
            if (error.name === 'NotAllowedError') {
                this.showNotification('Partage d\'écran', 'Permission refusée', 'error');
            } else if (error.name === 'NotFoundError') {
                this.showNotification('Partage d\'écran', 'Aucun écran disponible', 'error');
            } else {
                this.showNotification('Partage d\'écran', 'Erreur lors du partage', 'error');
            }
            
            return false;
        }
    }

    cleanupRemoteStream() {
        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => track.stop());
            this.remoteStream = null;
        }
        
        // Réafficher le placeholder
        const tutorVideo = document.getElementById('tutor-video');
        const tutorPlaceholder = document.getElementById('tutor-placeholder');
        
        if (tutorVideo) {
            tutorVideo.srcObject = null;
            tutorVideo.style.display = 'none';
        }
        
        if (tutorPlaceholder) {
            tutorPlaceholder.style.display = 'flex';
        }
    }

    disconnect() {
        console.log('🔌 Déconnexion PeerManager');
        
        // Fermer l'appel média
        if (this.call) {
            this.call.close();
            this.call = null;
        }
        
        // Fermer la connexion données
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        
        // Arrêter les flux média
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        this.cleanupRemoteStream();
        
        // Détruire le peer
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        
        console.log('✅ PeerManager nettoyé');
    }

    getConnectionStatus() {
        if (!this.peer) return 'disconnected';
        if (this.peer.disconnected) return 'disconnected';
        if (!this.peer.open) return 'connecting';
        if (this.connection && this.connection.open) return 'connected';
        return 'ready';
    }

    getStats() {
        return {
            peerId: this.peerId,
            tutorPeerId: this.tutorPeerId,
            status: this.getConnectionStatus(),
            hasLocalStream: !!this.localStream,
            hasRemoteStream: !!this.remoteStream,
            isCallActive: !!this.call,
            isDataConnected: !!(this.connection && this.connection.open)
        };
    }

    showNotification(title, message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(title, message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        }
    }
}

// Exporter la classe
window.PeerManager = PeerManager;

// Initialiser automatiquement si dans la page de tutorat
if (window.location.pathname.includes('tutoring-room')) {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Initialisation de PeerManager...');
        window.peerManager = new PeerManager();
    });
}