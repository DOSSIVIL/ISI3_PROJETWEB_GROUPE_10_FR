// scripts/chat-ai.js - VERSION COMPLÈTE AMÉLIORÉE
class ChatAI {
    constructor(options = {}) {
        this.apiKey = options.apiKey || localStorage.getItem('openai_api_key');
        this.model = options.model || 'gpt-3.5-turbo';
        this.temperature = options.temperature || 0.7;
        this.maxTokens = options.maxTokens || 250;
        this.context = [];
        this.maxContextLength = 15;
        this.isEnabled = false;
        this.role = options.role || 'assistant_dual'; // assistant_dual pour les deux rôles
        this.subject = options.subject || 'Général';
        this.userType = options.userType || 'student'; // 'student' ou 'tutor'
        this.name = options.name || 'Assistant IA';
        
        // Statistiques
        this.stats = {
            messagesSent: 0,
            suggestionsGiven: 0,
            questionsAnswered: 0
        };
        
        // Types de réponse disponibles
        this.responseTypes = {
            EXPLANATION: 'explication',
            EXERCISE: 'exercice',
            QUESTION: 'question',
            CORRECTION: 'correction',
            SUPPORT: 'support'
        };
        
        // Charger les statistiques sauvegardées
        this.loadStats();
    }

    async init() {
        if (!this.apiKey) {
            console.warn('Clé API OpenAI non configurée');
            this.isEnabled = false;
            return false;
        }
        
        this.isEnabled = true;
        this.loadContext();
        
        // Ajouter le prompt système adapté
        const systemPrompt = this.getSystemPrompt();
        this.addToContext('system', systemPrompt, true);
        
        console.log(`✅ ChatAI initialisé pour: ${this.userType} en ${this.subject}`);
        return true;
    }

    getSystemPrompt() {
        const basePrompt = `Tu es EduAssist, un assistant pédagogique intelligent intégré à la plateforme EduConnect Africa.
        
Règles générales:
- Sois précis, pédagogique et bienveillant
- Adapte tes réponses au niveau de l'utilisateur
- Utilise des exemples concrets et pertinents
- Propose toujours des ressources supplémentaires
- Sois concis mais complet
- Tu peux utiliser des émojis modérément pour rendre le dialogue plus vivant

Matière principale: ${this.subject}
`;

        if (this.userType === 'tutor') {
            return basePrompt + `
Rôle spécifique (Tuteur):
🎯 Tu aides le tuteur à:
1. Préparer et animer des sessions de tutorat
2. Expliquer des concepts complexes simplement
3. Générer des exercices adaptés au niveau de l'étudiant
4. Corriger les erreurs courantes
5. Fournir des ressources pédagogiques
6. Analyser les difficultés de l'étudiant
7. Proposer des méthodes d'enseignement alternatives

Style: Professionnel, technique, orienté pédagogie.
`;
        } else { // student
            return basePrompt + `
Rôle spécifique (Étudiant):
🎯 Tu aides l'étudiant à:
1. Comprendre les explications du tuteur
2. Poser des questions pertinentes
3. Réviser et consolider les connaissances
4. Préparer des exercices
5. Identifier ses points faibles
6. Organiser son apprentissage
7. Restituer les concepts dans ses propres mots

Style: Encourageant, patient, orienté apprentissage.
`;
        }
    }

    async generateResponse(userMessage, responseType = null, options = {}) {
        if (!this.isEnabled || !this.apiKey) {
            return { 
                success: false, 
                error: 'ChatAI non disponible',
                fallback: this.getFallbackResponse(responseType) 
            };
        }
        
        try {
            // Ajouter le message de l'utilisateur
            this.addToContext('user', userMessage);
            
            // Construire le message avec contexte et type de réponse
            const messages = this.buildMessages(userMessage, responseType, options);
            
            // Appeler l'API OpenAI
            const response = await this.callOpenAI(messages, options);
            
            if (!response.success) {
                throw new Error(response.error);
            }
            
            const aiResponse = response.data;
            
            // Ajouter la réponse au contexte
            this.addToContext('assistant', aiResponse);
            
            // Mettre à jour les statistiques
            this.updateStats(responseType);
            
            // Sauvegarder
            this.saveContext();
            this.saveStats();
            
            console.log(`✅ ChatAI: Réponse générée (${responseType || 'général'})`);
            
            return {
                success: true,
                message: aiResponse,
                type: responseType || 'general',
                usage: response.usage,
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error('❌ Erreur ChatAI:', error);
            return {
                success: false,
                error: error.message,
                fallback: this.getFallbackResponse(responseType)
            };
        }
    }

    async callOpenAI(messages, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: options.temperature || this.temperature,
                    max_tokens: options.maxTokens || this.maxTokens,
                    stream: false
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API error ${response.status}: ${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            
            return {
                success: true,
                data: data.choices[0].message.content,
                usage: data.usage
            };
            
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    buildMessages(userMessage, responseType, options = {}) {
        let messages = this.context.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }));
        
        // Ajouter des instructions spécifiques selon le type de réponse
        if (responseType) {
            const specificPrompt = this.getResponseTypePrompt(responseType, options);
            if (specificPrompt) {
                messages.unshift({
                    role: 'system',
                    content: specificPrompt
                });
            }
        }
        
        // Ajouter le contexte de la session
        if (this.subject !== 'Général') {
            messages.unshift({
                role: 'system',
                content: `Session de tutorat en ${this.subject}. Niveau: ${options.level || 'intermédiaire'}.`
            });
        }
        
        return messages;
    }

    getResponseTypePrompt(responseType, options = {}) {
        const prompts = {
            'explication': `Fournis une explication claire et pédagogique. 
Points à couvrir:
1. Définition simple du concept
2. Exemple concret
3. Analogie ou métaphore si utile
4. Points clés à retenir
5. Pièges à éviter

Niveau: ${options.level || 'intermédiaire'}
Format: Explication structurée avec emojis pour la clarté`,
            
            'exercice': `Génère un exercice pédagogique.
Structure:
📌 Énoncé clair et précis
🎯 Objectif d'apprentissage
💡 Indices (optionnels)
✅ Solution détaillée
🔍 Points de vérification

Difficulté: ${options.difficulty || 'moyenne'}
Sujet: ${options.topic || this.subject}`,
            
            'question': `Formule des questions pertinentes pour:
1. Vérifier la compréhension
2. Approfondir le sujet
3. Faire réfléchir
4. Identifier les difficultés

Nombre: ${options.count || 3} questions
Type: ${options.questionType || 'ouvertes'}`,
            
            'correction': `Corrige ou améliore le texte fourni.
Approche:
✓ Identifier les erreurs
✓ Proposer des corrections
✓ Expliquer les raisons
✓ Donner des alternatives
✓ Encourager l'amélioration

Ton: Constructif et bienveillant`,
            
            'support': `Fournis un support pédagogique.
Peut inclure:
📚 Ressources supplémentaires
🎯 Conseils d'apprentissage
⏱️ Stratégies de révision
📊 Méthodes d'évaluation
🤝 Conseils pour interagir avec le tuteur/étudiant`
        };
        
        return prompts[responseType] || null;
    }

    async generateExplanation(concept, level = 'beginner') {
        return await this.generateResponse(
            `Explique-moi le concept suivant: ${concept}`,
            'explication',
            { level }
        );
    }

    async generateExercise(topic, difficulty = 'medium') {
        return await this.generateResponse(
            `Génère un exercice sur le sujet: ${topic}`,
            'exercice',
            { difficulty, topic }
        );
    }

    async generateQuestions(count = 3, topic = null) {
        return await this.generateResponse(
            `Génère ${count} questions sur ${topic || this.subject}`,
            'question',
            { count, topic }
        );
    }

    async correctText(text) {
        return await this.generateResponse(
            `Corrige et améliore ce texte: ${text}`,
            'correction'
        );
    }

    async getLearningSupport() {
        return await this.generateResponse(
            'Donne-moi des conseils pour mieux apprendre',
            'support'
        );
    }

    getFallbackResponse(responseType = null) {
        const fallbacks = {
            'explication': [
                "Je vais préparer une explication détaillée. En attendant, pourriez-vous préciser ce que vous ne comprenez pas exactement ? 🤔",
                "Ce concept est intéressant ! Pour mieux vous expliquer, dites-moi quelle partie vous semble la plus complexe. 📚"
            ],
            'exercice': [
                "Je prépare un exercice adapté à votre niveau. Quel type d'exercice préférez-vous : pratique ou théorique ? ✨",
                "Excellente idée ! Je vous propose un exercice dans quelques instants. En attendant, avez-vous une préférence pour le format ? 🎯"
            ],
            'question': [
                "Je réfléchis à des questions pertinentes... En attendant, qu'aimeriez-vous approfondir ? ❓",
                "Parfait ! Je prépare quelques questions pour tester votre compréhension. Quel aspect du sujet vous intéresse le plus ? 💭"
            ],
            'correction': [
                "Je vais analyser votre texte et vous proposer des améliorations. Pourriez-vous préciser ce que vous voulez améliorer ? 📝",
                "Merci pour votre texte ! Je vous prépare des suggestions constructives. Quel est l'objectif principal de ce texte ? ✍️"
            ],
            'support': [
                "Je vous prépare des ressources et conseils adaptés. Quelles sont vos difficultés actuelles ? 🌟",
                "Excellente initiative ! Voici quelques conseils pour commencer, je compléterai ensuite selon vos besoins. 🚀"
            ],
            'general': [
                "Je réfléchis à votre demande... Pourriez-vous la reformuler ou ajouter des détails ? 💡",
                "Intéressant ! Je prépare une réponse adaptée. En attendant, avez-vous d'autres questions ? 🤗",
                "Merci pour votre message ! Je suis en train d'analyser votre demande pour vous répondre au mieux. ⏳"
            ]
        };
        
        const type = responseType || 'general';
        const list = fallbacks[type] || fallbacks.general;
        return list[Math.floor(Math.random() * list.length)];
    }

    addToContext(role, content, isSystem = false) {
        this.context.push({
            role: isSystem ? 'system' : role,
            content: content,
            timestamp: Date.now(),
            userType: this.userType
        });
        
        // Limiter la taille du contexte
        if (this.context.length > this.maxContextLength * 2) {
            // Garder les messages système et les plus récents
            const systemMessages = this.context.filter(msg => msg.role === 'system');
            const recentMessages = this.context
                .filter(msg => msg.role !== 'system')
                .slice(-this.maxContextLength);
            
            this.context = [...systemMessages, ...recentMessages];
        }
    }

    updateStats(responseType) {
        this.stats.messagesSent++;
        
        switch(responseType) {
            case 'explication':
            case 'exercice':
            case 'question':
                this.stats.questionsAnswered++;
                break;
            case 'correction':
            case 'support':
                this.stats.suggestionsGiven++;
                break;
        }
    }

    saveContext() {
        try {
            const key = `chat_ai_context_${this.userType}_${this.subject}`;
            const data = {
                context: this.context,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn('Impossible de sauvegarder le contexte:', error);
        }
    }

    loadContext() {
        try {
            const key = `chat_ai_context_${this.userType}_${this.subject}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                const data = JSON.parse(saved);
                // Garder seulement les contextes récents (moins de 24h)
                if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                    this.context = data.context;
                }
            }
        } catch (error) {
            console.warn('Impossible de charger le contexte:', error);
            this.context = [];
        }
    }

    saveStats() {
        try {
            localStorage.setItem(`chat_ai_stats_${this.userType}`, JSON.stringify(this.stats));
        } catch (error) {
            console.warn('Impossible de sauvegarder les statistiques:', error);
        }
    }

    loadStats() {
        try {
            const saved = localStorage.getItem(`chat_ai_stats_${this.userType}`);
            if (saved) {
                this.stats = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Impossible de charger les statistiques:', error);
        }
    }

    clearContext() {
        this.context = [];
        const key = `chat_ai_context_${this.userType}_${this.subject}`;
        localStorage.removeItem(key);
        console.log('Contexte ChatAI effacé');
    }

    resetStats() {
        this.stats = {
            messagesSent: 0,
            suggestionsGiven: 0,
            questionsAnswered: 0
        };
        localStorage.removeItem(`chat_ai_stats_${this.userType}`);
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('openai_api_key', apiKey);
        this.isEnabled = true;
        console.log('Clé API mise à jour');
    }

    setSubject(subject) {
        this.subject = subject;
        console.log(`Sujet ChatAI mis à jour: ${subject}`);
    }

    setUserType(userType) {
        this.userType = userType;
        console.log(`Type utilisateur ChatAI mis à jour: ${userType}`);
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        localStorage.setItem('chat_ai_enabled', this.isEnabled.toString());
        console.log(`ChatAI ${this.isEnabled ? 'activé' : 'désactivé'}`);
        return this.isEnabled;
    }

    getStats() {
        return {
            ...this.stats,
            isEnabled: this.isEnabled,
            subject: this.subject,
            userType: this.userType,
            contextSize: this.context.length
        };
    }
}

// Singleton pour l'instance unique
let chatAIInstance = null;

function getChatAI(options = {}) {
    if (!chatAIInstance) {
        chatAIInstance = new ChatAI(options);
    }
    return chatAIInstance;
}

// Exporter
window.ChatAI = ChatAI;
window.getChatAI = getChatAI;