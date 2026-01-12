/**
 * Chat AI Manager - Intégration OpenRouter API
 * Gère l'assistant IA EduAssist dans la salle de tutorat
 */

class ChatAIManager {
    constructor() {
        // Configuration API OpenRouter
        this.apiKey = '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';
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.model = 'mistralai/mistral-7b-instruct:free'; // Modèle gratuit
        
        // Paramètres de génération
        this.temperature = 0.7;
        this.maxTokens = 1000;
        
        // Éléments DOM
        this.aiFloatingBtn = document.getElementById('ai-floating-btn');
        this.aiPanel = document.getElementById('ai-panel');
        this.aiCloseBtn = document.getElementById('ai-close');
        this.aiInput = document.getElementById('ai-input');
        this.aiSendBtn = document.getElementById('ai-send');
        this.aiResponse = document.getElementById('ai-response');
        this.aiTabs = document.querySelectorAll('.ai-tab');
        this.aiActionBtns = document.querySelectorAll('.ai-action-btn');
        this.aiBadge = document.getElementById('ai-badge');
        
        // État
        this.isOpen = false;
        this.isLoading = false;
        this.currentAction = null;
        this.conversationHistory = [];
        this.maxHistoryLength = 5;
        
        // Initialiser
        this.initialize();
    }
    
    /**
     * Initialiser les événements
     */
    initialize() {
        console.log('Initialisation du ChatAIManager');
        
        // Bouton flottant
        this.aiFloatingBtn?.addEventListener('click', () => this.togglePanel());
        this.aiCloseBtn?.addEventListener('click', () => this.closePanel());
        
        // Onglets
        this.aiTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.closest('.ai-tab')));
        });
        
        // Boutons d'action
        this.aiActionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAction(e.currentTarget));
        });
        
        // Envoi du message
        this.aiSendBtn?.addEventListener('click', () => this.sendMessage());
        this.aiInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Fermer le panel avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closePanel();
            }
        });
        
        console.log('ChatAIManager initialisé');
    }
    
    /**
     * Basculer le panneau ouvert/fermé
     */
    togglePanel() {
        if (this.isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }
    
    /**
     * Ouvrir le panneau
     */
    openPanel() {
        this.isOpen = true;
        this.aiPanel?.classList.remove('hidden');
        this.aiFloatingBtn?.classList.add('active');
        this.aiInput?.focus();
        this.aiBadge?.style.display === 'flex' && (this.aiBadge.style.display = 'none');
    }
    
    /**
     * Fermer le panneau
     */
    closePanel() {
        this.isOpen = false;
        this.aiPanel?.classList.add('hidden');
        this.aiFloatingBtn?.classList.remove('active');
    }
    
    /**
     * Changer d'onglet
     */
    switchTab(tabBtn) {
        if (!tabBtn) return;
        
        // Retirer la classe active de tous les onglets
        this.aiTabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.ai-tab-content').forEach(c => c.classList.add('hidden'));
        
        // Ajouter la classe active au nouvel onglet
        tabBtn.classList.add('active');
        const tabName = tabBtn.dataset.tab;
        const tabContent = document.getElementById(`ai-tab-${tabName}`);
        if (tabContent) {
            tabContent.classList.remove('hidden');
        }
    }
    
    /**
     * Sélectionner une action
     */
    selectAction(btn) {
        // Retirer la classe active de tous les boutons
        this.aiActionBtns.forEach(b => b.classList.remove('active'));
        
        // Ajouter la classe active au bouton cliqué
        btn.classList.add('active');
        
        // Définir l'action actuelle
        this.currentAction = btn.dataset.action;
        
        // Remplir le placeholder en fonction de l'action
        const placeholders = {
            'explain': 'Explique ce concept...',
            'exercise': 'Génère un exercice sur...',
            'questions': 'Pose-moi des questions sur...',
            'correct': 'Corrige mon texte...',
            'summarize': 'Résume ce concept...',
            'resources': 'Trouve des ressources sur...'
        };
        
        this.aiInput.placeholder = placeholders[this.currentAction] || 'Posez votre question à l\'assistant IA...';
        this.aiInput.focus();
    }
    
    /**
     * Envoyer un message à l'IA
     */
    async sendMessage() {
        const message = this.aiInput?.value.trim();
        
        if (!message) {
            this.showError('Veuillez entrer un message');
            return;
        }
        
        if (this.isLoading) {
            this.showError('Une requête est en cours...');
            return;
        }
        
        // Préparer le prompt en fonction de l'action
        const fullPrompt = this.buildPrompt(message);
        
        // Afficher le message et commencer le chargement
        this.displayUserMessage(message);
        this.showLoading();
        this.isLoading = true;
        
        try {
            // Appeler l'API OpenRouter
            const response = await this.callOpenRouter(fullPrompt);
            
            // Afficher la réponse
            this.displayAIResponse(response);
            
            // Ajouter à l'historique
            this.addToHistory({
                userMessage: message,
                aiResponse: response,
                action: this.currentAction
            });
            
        } catch (error) {
            console.error('Erreur API:', error);
            this.showError(`Erreur: ${error.message}`);
        } finally {
            this.isLoading = false;
            this.aiInput.value = '';
            this.hideLoading();
        }
    }
    
    /**
     * Construire le prompt en fonction de l'action
     */
    buildPrompt(userMessage) {
        const systemPrompts = {
            'explain': `Tu es un tuteur expert en sciences. Explique le concept suivant de manière claire et pédagogique, avec des exemples si possible. Réponds en français.`,
            'exercise': `Tu es un professeur créatif. Crée un exercice pratique et intéressant sur le sujet suivant. Inclus des instructions claires et une difficulté progressive. Réponds en français.`,
            'questions': `Tu es un tuteur qui pose des questions pertinentes pour tester la compréhension. Pose 3-4 questions intelligentes sur le sujet suivant, sans donner les réponses. Réponds en français.`,
            'correct': `Tu es un correcteur expert. Corrige le texte suivant en français. Signale les erreurs grammaticales, orthographiques et les suggestions d'amélioration. Réponds en français.`,
            'summarize': `Tu es un expert en synthèse. Résume le concept suivant en points clés de manière concise et claire. Réponds en français.`,
            'resources': `Tu es un conseiller pédagogique. Suggère des ressources d'apprentissage appropriées pour le sujet suivant. Réponds en français.`
        };
        
        const systemPrompt = systemPrompts[this.currentAction] || systemPrompts['explain'];
        
        return `${systemPrompt}\n\nSujet: ${userMessage}`;
    }
    
    /**
     * Appeler l'API OpenRouter
     */
    async callOpenRouter(prompt) {
        const requestBody = {
            model: this.model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: this.temperature,
            max_tokens: this.maxTokens
        };
        
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'EduConnect Africa - Tutoring Room'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0]?.message?.content) {
            throw new Error('Réponse invalide de l\'API');
        }
        
        return data.choices[0].message.content;
    }
    
    /**
     * Afficher le message de l'utilisateur
     */
    displayUserMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'ai-response' ;
        messageEl.innerHTML = `
            <h5><i class="fas fa-user"></i> Vous</h5>
            <p>${this.escapeHtml(message)}</p>
        `;
        
        this.aiResponse?.parentElement?.insertBefore(messageEl, this.aiResponse);
    }
    
    /**
     * Afficher la réponse de l'IA
     */
    displayAIResponse(response) {
        if (!this.aiResponse) return;
        
        this.aiResponse.classList.remove('hidden', 'loading');
        this.aiResponse.innerHTML = `
            <h5><i class="fas fa-robot"></i> EduAssist</h5>
            <p>${this.formatResponse(response)}</p>
            <div class="ai-response-actions">
                <button onclick="chatAIManager.copyToClipboard('${this.escapeHtml(response)}')">
                    <i class="fas fa-copy"></i> Copier
                </button>
                <button onclick="chatAIManager.expandResponse()">
                    <i class="fas fa-expand"></i> Agrandir
                </button>
            </div>
        `;
    }
    
    /**
     * Formater la réponse pour l'affichage
     */
    formatResponse(response) {
        return this.escapeHtml(response)
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }
    
    /**
     * Afficher le chargement
     */
    showLoading() {
        if (!this.aiResponse) return;
        
        this.aiResponse.classList.remove('hidden');
        this.aiResponse.classList.add('loading');
        this.aiResponse.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top: 4px solid #1a3b52; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s linear infinite;"></div>
                <p>Génération en cours...</p>
                <p style="color: #6b7280; font-size: 0.9rem;">L'assistant réfléchit à votre question</p>
            </div>
        `;
    }
    
    /**
     * Masquer le chargement
     */
    hideLoading() {
        if (this.aiResponse?.classList.contains('loading')) {
            this.aiResponse.classList.remove('loading');
        }
    }
    
    /**
     * Afficher une erreur
     */
    showError(message) {
        if (!this.aiResponse) return;
        
        this.aiResponse.classList.remove('hidden');
        this.aiResponse.classList.add('ai-error');
        this.aiResponse.innerHTML = `
            <h5><i class="fas fa-exclamation-circle"></i> Erreur</h5>
            <p>${this.escapeHtml(message)}</p>
        `;
    }
    
    /**
     * Copier le texte au presse-papiers
     */
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copié au presse-papiers', 'success');
        }).catch(err => {
            console.error('Erreur copie:', err);
            this.showNotification('Erreur lors de la copie', 'error');
        });
    }
    
    /**
     * Agrandir la réponse
     */
    expandResponse() {
        if (this.aiPanel?.style.width === '90vw') {
            this.aiPanel.style.width = '380px';
        } else {
            this.aiPanel.style.width = '90vw';
            this.aiPanel.style.maxHeight = '90vh';
        }
    }
    
    /**
     * Ajouter à l'historique
     */
    addToHistory(entry) {
        this.conversationHistory.push(entry);
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory.shift();
        }
        this.updateHistoryTabs();
    }
    
    /**
     * Mettre à jour les onglets avec l'historique
     */
    updateHistoryTabs() {
        const explanationsList = document.getElementById('explanations-list');
        const exercisesList = document.getElementById('exercises-list');
        
        if (explanationsList || exercisesList) {
            // Implémenter la logique pour afficher l'historique
            console.log('Historique mis à jour:', this.conversationHistory);
        }
    }
    
    /**
     * Afficher une notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `ai-notification ${type}`;
        notification.innerHTML = `<strong>${message}</strong>`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * Échapper le HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Setter pour changer de modèle
     */
    setModel(modelId) {
        this.model = modelId;
        console.log('Modèle changé à:', modelId);
    }
    
    /**
     * Setter pour changer la température
     */
    setTemperature(temp) {
        this.temperature = Math.max(0, Math.min(1, temp));
    }
    
    /**
     * Setter pour changer le max tokens
     */
    setMaxTokens(tokens) {
        this.maxTokens = Math.max(100, Math.min(2000, tokens));
    }
}

// Initialiser le gestionnaire du chat IA
let chatAIManager;
document.addEventListener('DOMContentLoaded', () => {
    if (!chatAIManager) {
        chatAIManager = new ChatAIManager();
        console.log('ChatAIManager global initialisé');
    }
});