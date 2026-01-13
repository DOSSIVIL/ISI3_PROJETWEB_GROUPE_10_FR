// ==================== CONFIGURATION FIREBASE ====================
const firebaseConfig = {
    apiKey: "AIzaSyAHnlS177olRKu3WJBO-yTQsd4vNI0MIFs",
    authDomain: "achitectureweb-groupe-10.firebaseapp.com",
    projectId: "achitectureweb-groupe-10",
    storageBucket: "achitectureweb-groupe-10.firebasestorage.app",
    messagingSenderId: "646899550480",
    appId: "1:646899550480:web:687fd4f4b2e0ca646efd95"
};

// Variables globales pour Firebase
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseInitialized = false;

// Configuration API OpenRouter
const API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "mistralai/mistral-7b-instruct:free";

// Configuration des catégories
const categories = {
    mathematiques: {
        name: "Mathématiques",
        icon: "fa-calculator",
        color: "#3b82f6",
        context: "Vous êtes un expert en mathématiques. Répondez aux questions de manière précise et détaillée, avec des explications claires et des exemples concrets quand nécessaire."
    },
    physique: {
        name: "Physique",
        icon: "fa-atom",
        color: "#2563eb",
        context: "Vous êtes un expert en physique. Fournissez des explications scientifiques précises, utilisez des formules appropriées et expliquez les concepts physiques de manière accessible."
    },
    terre: {
        name: "Sciences de la Terre",
        icon: "fa-globe-africa",
        color: "#1d4ed8",
        context: "Vous êtes un expert en sciences de la Terre. Parlez de géologie, météorologie, océanographie et environnement avec un accent particulier sur l'Afrique et le Cameroun."
    },
    litterature: {
        name: "Littérature camerounaise",
        icon: "fa-book-open",
        color: "#60a5fa",
        context: "Vous êtes un expert en littérature camerounaise. Parlez des auteurs, œuvres, mouvements littéraires et spécificités culturelles du Cameroun. Mentionnez des auteurs comme Mongo Beti, Ferdinand Oyono, etc."
    },
    informatique: {
        name: "Informatique",
        icon: "fa-laptop-code",
        color: "#93c5fd",
        context: "Vous êtes un expert en informatique. Répondez aux questions sur la programmation, les technologies, les concepts informatiques avec des exemples pratiques et du code quand nécessaire."
    }
};

// Variables globales
let currentCategory = null;
let currentConversationId = null;
let conversations = [];
let isLoading = false;
let currentUser = null;
let userData = null;
let isSidebarExpanded = true;
let isHistoryVisible = false;

// ==================== INITIALISATION FIREBASE ====================
async function initFirebase() {
    try {
        // Vérifier si Firebase est déjà initialisé
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
        } else {
            firebaseApp = firebase.app();
        }
        
        firebaseAuth = firebase.auth();
        firebaseDb = firebase.firestore();
        firebaseInitialized = true;
        
        console.log("✅ Firebase initialisé avec succès");
        
        // Vérifier l'état d'authentification
        firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                console.log("👤 Utilisateur connecté:", user.uid);
                await loadUserData(user.uid);
                await loadUserConversations(user.uid);
                updateUserInfo();
            } else {
                console.log("⚠️ Utilisateur non connecté");
                // Rediriger vers la page de connexion si non authentifié
                showToast("Veuillez vous connecter pour utiliser l'assistant", "warning");
                setTimeout(() => {
                    window.location.href = "/src/views/templates/Connexion.html";
                }, 2000);
            }
        });
        
    } catch (error) {
        console.error("❌ Erreur d'initialisation Firebase:", error);
        showToast("Erreur de connexion au service", "error");
        // Fallback: cacher le loader
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('main-container').classList.remove('hidden');
        }, 1000);
    }
}

// ==================== CHARGEMENT DES DONNÉES UTILISATEUR ====================
async function loadUserData(userId) {
    try {
        const db = firebase.firestore();
        
        // Essayer d'abord la collection enseignants
        let userRef = db.collection('enseignants').doc(userId);
        let userDoc = await userRef.get();
        
        if (userDoc.exists) {
            userData = userDoc.data();
            userData.role = 'enseignant';
            console.log("📚 Profil enseignant chargé");
            return;
        }
        
        // Essayer la collection etudiants
        userRef = db.collection('etudiants').doc(userId);
        userDoc = await userRef.get();
        
        if (userDoc.exists) {
            userData = userDoc.data();
            userData.role = 'etudiant';
            console.log("🎓 Profil étudiant chargé");
            return;
        }
        
        console.warn("⚠️ Aucun profil trouvé pour l'utilisateur");
        userData = {
            display_name: currentUser.email.split('@')[0],
            role: 'utilisateur'
        };
        
    } catch (error) {
        console.error("❌ Erreur lors du chargement des données utilisateur:", error);
        userData = {
            display_name: currentUser.email.split('@')[0],
            role: 'utilisateur'
        };
    }
}

// ==================== GESTION DES CONVERSATIONS FIREBASE ====================
async function saveConversationToFirebase(conversationData) {
    if (!firebaseInitialized || !currentUser) {
        console.warn("⚠️ Firebase non initialisé ou utilisateur non connecté");
        return null;
    }
    
    try {
        const db = firebase.firestore();
        const conversationsRef = db.collection('assistantIA');
        
        const conversation = {
            userId: currentUser.uid,
            userName: userData?.display_name || currentUser.email,
            userEmail: currentUser.email,
            userRole: userData?.role || 'utilisateur',
            category: conversationData.category,
            question: conversationData.question,
            response: conversationData.response,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: new Date().toISOString(),
            conversationId: conversationData.conversationId || Date.now().toString()
        };
        
        console.log("💾 Sauvegarde conversation dans Firebase...");
        const docRef = await conversationsRef.add(conversation);
        console.log("✅ Conversation sauvegardée dans Firebase avec ID:", docRef.id);
        
        // Recharger les conversations après sauvegarde
        setTimeout(() => loadUserConversations(currentUser.uid), 500);
        
        return docRef.id;
        
    } catch (error) {
        console.error("❌ Erreur lors de la sauvegarde dans Firebase:", error);
        
        // Essayer avec une requête simplifiée (sans index composite)
        if (error.code === 'failed-precondition') {
            console.log("🔄 Tentative avec sauvegarde simplifiée...");
            try {
                await saveConversationSimple(conversationData);
            } catch (simpleError) {
                console.error("❌ Échec de la sauvegarde simplifiée:", simpleError);
                showToast("Conversation sauvegardée localement uniquement", "warning");
            }
        } else {
            showToast("Erreur lors de la sauvegarde de la conversation", "error");
        }
        return null;
    }
}

// Fonction de sauvegarde simplifiée (sans index composite)
async function saveConversationSimple(conversationData) {
    const db = firebase.firestore();
    const conversationsRef = db.collection('assistantIA_simple');
    
    const conversation = {
        userId: currentUser.uid,
        userName: userData?.display_name || currentUser.email,
        category: conversationData.category,
        question: conversationData.question,
        response: conversationData.response,
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    const docRef = await conversationsRef.add(conversation);
    console.log("✅ Conversation sauvegardée dans collection simplifiée");
    return docRef.id;
}

async function loadUserConversations(userId) {
    if (!firebaseInitialized || !userId) {
        console.warn("⚠️ Firebase non initialisé ou utilisateur non connecté");
        loadConversationsFromLocalStorage();
        return;
    }
    
    try {
        const db = firebase.firestore();
        const conversationsRef = db.collection('assistantIA');
        
        console.log("📥 Chargement des conversations depuis Firebase...");
        
        // Essayer d'abord avec la requête simple (sans orderBy)
        try {
            const querySnapshot = await conversationsRef
                .where('userId', '==', userId)
                .get();
            
            conversations = [];
            
            if (querySnapshot.empty) {
                console.log("📭 Aucune conversation trouvée");
                loadConversationsFromLocalStorage();
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const timestamp = data.timestamp ? 
                    (data.timestamp.toDate ? data.timestamp.toDate().toISOString() : data.timestamp) : 
                    (data.createdAt || new Date().toISOString());
                
                conversations.push({
                    id: doc.id,
                    firestoreId: doc.id,
                    title: data.question ? 
                        (data.question.substring(0, 25) + (data.question.length > 25 ? '...' : '')) : 
                        "Conversation",
                    category: data.category,
                    timestamp: timestamp,
                    messages: [
                        { 
                            role: 'user', 
                            content: data.question || "Question", 
                            timestamp: timestamp 
                        },
                        { 
                            role: 'assistant', 
                            content: data.response || "Réponse", 
                            timestamp: timestamp 
                        }
                    ]
                });
            });
            
            // Trier par date décroissante côté client
            conversations.sort((a, b) => {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
            
            console.log(`✅ ${conversations.length} conversations chargées`);
            
            // Mettre à jour l'interface
            loadConversations();
            updateHistoryBadge();
            
        } catch (error) {
            console.error("❌ Erreur lors du chargement des conversations:", error);
            
            // Essayer la collection simplifiée
            if (error.code === 'failed-precondition') {
                console.log("🔄 Tentative avec collection simplifiée...");
                await loadFromSimpleCollection(userId);
            } else {
                loadConversationsFromLocalStorage();
            }
        }
        
    } catch (error) {
        console.error("❌ Erreur générale lors du chargement:", error);
        loadConversationsFromLocalStorage();
    }
}

async function loadFromSimpleCollection(userId) {
    try {
        const db = firebase.firestore();
        const conversationsRef = db.collection('assistantIA_simple');
        
        const querySnapshot = await conversationsRef
            .where('userId', '==', userId)
            .get();
        
        conversations = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            conversations.push({
                id: doc.id,
                firestoreId: doc.id,
                title: data.question ? 
                    (data.question.substring(0, 25) + (data.question.length > 25 ? '...' : '')) : 
                    "Conversation",
                category: data.category,
                timestamp: data.createdAt || new Date().toISOString(),
                messages: [
                    { role: 'user', content: data.question, timestamp: data.createdAt },
                    { role: 'assistant', content: data.response, timestamp: data.createdAt }
                ]
            });
        });
        
        // Trier par date décroissante
        conversations.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        console.log(`✅ ${conversations.length} conversations chargées (collection simplifiée)`);
        loadConversations();
        
    } catch (error) {
        console.error("❌ Échec du chargement simplifié:", error);
        loadConversationsFromLocalStorage();
    }
}

function loadConversationsFromLocalStorage() {
    const localConversations = JSON.parse(localStorage.getItem('educonnect_conversations') || '[]');
    
    conversations = localConversations.map(conv => ({
        id: conv.localId || 'local_' + Math.random().toString(36).substr(2, 9),
        firestoreId: null,
        title: conv.question ? 
            (conv.question.substring(0, 25) + (conv.question.length > 25 ? '...' : '')) : 
            "Conversation locale",
        category: conv.category,
        timestamp: conv.timestamp || conv.createdAt || new Date().toISOString(),
        messages: [
            { role: 'user', content: conv.question, timestamp: conv.timestamp },
            { role: 'assistant', content: conv.response, timestamp: conv.timestamp }
        ]
    }));
    
    // Trier par date
    conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log(`📱 ${conversations.length} conversations chargées depuis localStorage`);
    loadConversations();
}

// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    // Initialiser Firebase
    await initFirebase();
    
    // Configurer le compteur de caractères
    const promptInput = document.getElementById('prompt');
    const charCount = document.getElementById('charCount');
    
    promptInput.addEventListener('input', () => {
        const length = promptInput.value.length;
        charCount.textContent = `${length}/1000`;
        
        if (length > 950) {
            charCount.style.color = '#ef4444';
        } else if (length > 800) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#9ca3af';
        }
        
        // Ajuster automatiquement la hauteur
        promptInput.style.height = 'auto';
        promptInput.style.height = Math.min(promptInput.scrollHeight, 120) + 'px';
    });
    
    // Configurer la saisie (Ctrl+Enter pour envoyer)
    promptInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-focus sur le champ de saisie
    promptInput.focus();
    
    // Cacher le loader et afficher l'interface
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('main-container').classList.remove('hidden');
        
        if (currentUser) {
            showToast(`Bienvenue ${userData?.display_name || currentUser.email} !`, 'info');
        }
        
        // Initialiser le responsive
        handleResize();
    }, 1500);
});

// ==================== FONCTIONS UTILISATEUR ====================
function updateUserInfo() {
    if (!userData && !currentUser) return;
    
    const userInfoDiv = document.getElementById('userInfo');
    const userNameSpan = document.getElementById('userName');
    
    if (userData?.display_name) {
        userNameSpan.textContent = userData.display_name;
        userInfoDiv.classList.remove('hidden');
    } else if (currentUser?.email) {
        const shortEmail = currentUser.email.split('@')[0];
        userNameSpan.textContent = shortEmail.length > 12 ? shortEmail.substring(0, 10) + '...' : shortEmail;
        userInfoDiv.classList.remove('hidden');
    }
}

function updateHistoryBadge() {
    const badge = document.getElementById('historyBadge');
    const collapsedCount = document.getElementById('collapsedConversationCount');
    
    if (conversations.length > 0) {
        badge.textContent = conversations.length > 9 ? '9+' : conversations.length;
        badge.classList.remove('hidden');
        collapsedCount.textContent = conversations.length > 9 ? '9+' : conversations.length;
    } else {
        badge.classList.add('hidden');
        collapsedCount.textContent = '0';
    }
}

// ==================== GESTION DES CATÉGORIES ====================
function selectCategory(categoryKey) {
    if (categories[categoryKey]) {
        currentCategory = categoryKey;
        
        // Mettre à jour l'interface
        const category = categories[categoryKey];
        document.getElementById('categoryIndicator').classList.remove('hidden');
        document.getElementById('currentCategory').textContent = category.name;
        document.getElementById('categoryIcon').className = `fas ${category.icon}`;
        document.getElementById('categoryIcon').style.color = category.color;
        
        // Ajouter un badge de catégorie dans le chat
        addCategoryMessage(category.name, category.color);
        
        showToast(`Catégorie : ${category.name}`, 'success');
    }
}

function clearCategory() {
    currentCategory = null;
    document.getElementById('categoryIndicator').classList.add('hidden');
    showToast('Catégorie désélectionnée', 'warning');
}

function addCategoryMessage(categoryName, color) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'slide-up';
    messageDiv.innerHTML = `
        <div class="inline-flex items-center px-3 py-1.5 mb-3 rounded-lg" style="background: ${color}15; border-left: 3px solid ${color}">
            <i class="mr-2" style="color: ${color}"></i>
            <span class="font-medium text-white text-responsive-sm">Mode : ${categoryName}</span>
            <span class="ml-2 text-xs text-gray-300 text-responsive-sm">• L'assistant répondra dans ce contexte</span>
        </div>
    `;
    messagesDiv.appendChild(messageDiv);
    scrollToBottom();
}

// ==================== GESTION DES CONVERSATIONS ====================
function newConversation() {
    currentConversationId = Date.now().toString();
    
    // Effacer le chat
    document.getElementById('messages').innerHTML = `
        <div class="p-3 md:p-4 lg:p-6 rounded-2xl glass-effect slide-up message-container">
            <div class="flex items-start space-x-3 md:space-x-4">
                <div class="flex-shrink-0">
                    <div class="p-2 md:p-3 rounded-full" style="background: linear-gradient(135deg, #3b82f6, #2563eb)">
                        <i class="text-lg md:text-xl lg:text-2xl text-white fas fa-robot"></i>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="mb-1.5 md:mb-2 text-base md:text-lg lg:text-xl font-bold text-white">
                        <span class="gradient-edu">Edu</span><span class="gradient-connect">Connect</span> Assistant IA
                    </h3>
                    <p class="text-gray-300 text-responsive">
                        Nouvelle conversation créée !
                    </p>
                    <p class="text-white font-medium mt-1.5 mb-1 text-responsive">Pour commencer :</p>
                    <ol class="ml-4 text-gray-300 text-responsive list-decimal space-y-0.5">
                        <li>Sélectionnez une catégorie ci-dessus</li>
                        <li>Posez votre question dans la zone de texte</li>
                        <li>Je vous répondrai dans le contexte choisi</li>
                    </ol>
                </div>
            </div>
        </div>
    `;
    
    if (currentCategory) {
        const category = categories[currentCategory];
        addCategoryMessage(category.name, category.color);
    }
    
    showToast('Nouvelle conversation créée', 'success');
    
    // Fermer l'historique sur mobile
    if (window.innerWidth < 768) {
        toggleHistory();
    }
}

function loadConversations() {
    const listDiv = document.getElementById('conversationsList');
    const totalMessages = conversations.reduce((total, conv) => total + conv.messages.length, 0);
    
    // Mettre à jour les statistiques
    document.getElementById('totalConversations').textContent = conversations.length;
    document.getElementById('totalMessages').textContent = totalMessages;
    
    updateHistoryBadge();
    
    if (conversations.length === 0) {
        listDiv.innerHTML = `
            <div class="p-4 text-center">
                <i class="fas fa-comments text-2xl text-gray-500 mb-2"></i>
                <p class="text-sm text-gray-400">Aucune conversation</p>
                <p class="text-xs text-gray-500 mt-1">Vos conversations apparaîtront ici</p>
            </div>
        `;
        return;
    }
    
    listDiv.innerHTML = conversations.slice(0, 20).map(conv => `
        <div onclick="loadFirebaseConversation('${conv.firestoreId || conv.id}')" 
             class="p-2.5 rounded-lg cursor-pointer glass-effect hover:bg-gray-800/50 active:scale-95 transition-all ${currentConversationId === conv.id ? 'ring-1 ring-[#3b82f6]' : ''}">
            <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-white truncate text-responsive-sm flex-1 mr-2">${conv.title}</span>
                <span class="text-xs text-gray-400 flex-shrink-0">${formatDate(conv.timestamp)}</span>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400 text-responsive-sm">
                    ${conv.messages.length} message${conv.messages.length > 1 ? 's' : ''}
                </span>
                ${conv.category ? `
                    <div class="category-badge text-xs" style="background: ${categories[conv.category]?.color || '#3b82f6'}">
                        <i class="fas ${categories[conv.category]?.icon || 'fa-tag'}"></i>
                        <span class="hidden sm:inline ml-0.5">${categories[conv.category]?.name?.substring(0, 3) || ''}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function loadFirebaseConversation(firestoreId) {
    try {
        if (!firebaseInitialized) {
            // Essayer de trouver dans les conversations locales
            const localConv = conversations.find(c => c.id === firestoreId || c.firestoreId === firestoreId);
            if (localConv) {
                loadLocalConversation(localConv);
                return;
            }
            return;
        }
        
        const db = firebase.firestore();
        let conversationDoc;
        
        // Essayer d'abord dans assistantIA
        try {
            conversationDoc = await db.collection('assistantIA').doc(firestoreId).get();
        } catch (error) {
            // Essayer dans assistantIA_simple
            conversationDoc = await db.collection('assistantIA_simple').doc(firestoreId).get();
        }
        
        if (!conversationDoc.exists) {
            showToast("Conversation non trouvée", "error");
            return;
        }
        
        const data = conversationDoc.data();
        
        // Charger la conversation dans l'interface
        currentConversationId = firestoreId;
        currentCategory = data.category;
        
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';
        
        // Afficher les messages
        const timestamp = data.timestamp ? 
            (data.timestamp.toDate ? data.timestamp.toDate().toISOString() : data.timestamp) : 
            data.createdAt;
        
        addUserMessage(data.question, true, timestamp);
        addAIMessage(data.response, true, timestamp);
        
        // Mettre à jour l'interface
        if (currentCategory) {
            const category = categories[currentCategory];
            document.getElementById('categoryIndicator').classList.remove('hidden');
            document.getElementById('currentCategory').textContent = category.name;
            document.getElementById('categoryIcon').className = `fas ${category.icon}`;
            document.getElementById('categoryIcon').style.color = category.color;
        }
        
        showToast(`Conversation chargée`, 'info');
        
        // Fermer l'historique sur mobile
        if (window.innerWidth < 768) {
            toggleHistory();
        }
        
    } catch (error) {
        console.error("Erreur lors du chargement de la conversation:", error);
        showToast("Erreur lors du chargement", "error");
    }
}

function loadLocalConversation(conversation) {
    currentConversationId = conversation.id;
    currentCategory = conversation.category;
    
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    
    // Afficher les messages
    conversation.messages.forEach(msg => {
        if (msg.role === 'user') {
            addUserMessage(msg.content, true, msg.timestamp);
        } else if (msg.role === 'assistant') {
            addAIMessage(msg.content, true, msg.timestamp);
        }
    });
    
    // Mettre à jour l'interface
    if (currentCategory) {
        const category = categories[currentCategory];
        document.getElementById('categoryIndicator').classList.remove('hidden');
        document.getElementById('currentCategory').textContent = category.name;
        document.getElementById('categoryIcon').className = `fas ${category.icon}`;
        document.getElementById('categoryIcon').style.color = category.color;
    }
    
    showToast(`Conversation locale chargée`, 'info');
    
    // Fermer l'historique sur mobile
    if (window.innerWidth < 768) {
        toggleHistory();
    }
}

// ==================== FONCTION POUR ENVOYER UN MESSAGE ====================
async function sendMessage() {
    if (isLoading) return;
    
    if (!currentUser) {
        showToast('Veuillez vous connecter pour utiliser l\'assistant', 'warning');
        return;
    }
    
    if (!currentCategory) {
        showToast('Veuillez d\'abord sélectionner une catégorie', 'warning');
        return;
    }
    
    const promptInput = document.getElementById('prompt');
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        showToast('Veuillez entrer un message', 'warning');
        promptInput.focus();
        return;
    }
    
    // Créer une nouvelle conversation si nécessaire
    if (!currentConversationId) {
        newConversation();
    }
    
    // Ajouter le message utilisateur avec l'heure
    const userTimestamp = new Date();
    addUserMessage(prompt, false, userTimestamp.toISOString());
    
    // Effacer le champ de saisie
    promptInput.value = '';
    promptInput.style.height = 'auto';
    document.getElementById('charCount').textContent = '0/1000';
    document.getElementById('charCount').style.color = '#9ca3af';
    
    // Afficher l'indicateur de frappe
    document.getElementById('typingIndicator').classList.remove('hidden');
    
    isLoading = true;
    document.getElementById('sendBtn').disabled = true;
    
    // Préparer le contexte de la catégorie
    const category = categories[currentCategory];
    const systemPrompt = category.context + "\n\nRéponds en français de manière claire et détaillée.";
    
    // Préparer les données
    const requestData = {
        model: MODEL,
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 400
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'EduConnect Africa'
            },
            body: JSON.stringify(requestData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || `Erreur HTTP ${response.status}`);
        }
        
        // Retirer l'indicateur de frappe
        document.getElementById('typingIndicator').classList.add('hidden');
        
        // Afficher la réponse avec l'heure
        if (data.choices && data.choices[0]) {
            const content = data.choices[0].message.content;
            const aiTimestamp = new Date();
            addAIMessage(content, false, aiTimestamp.toISOString());
            
            // Sauvegarder la conversation dans Firebase
            const conversationData = {
                conversationId: currentConversationId,
                category: currentCategory,
                question: prompt,
                response: content
            };
            
            await saveConversationToFirebase(conversationData);
            
            showToast(`Réponse reçue`, 'success');
        } else {
            throw new Error('Aucune réponse générée');
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('typingIndicator').classList.add('hidden');
        const errorTimestamp = new Date();
        addAIMessage(`❌ Désolé, une erreur s'est produite :\n\n${error.message}\n\nVeuillez réessayer.`, false, errorTimestamp.toISOString());
        showToast(`Erreur: ${error.message.substring(0, 50)}...`, 'error');
    } finally {
        isLoading = false;
        document.getElementById('sendBtn').disabled = false;
        scrollToBottom();
        promptInput.focus();
    }
}

// ==================== FONCTIONS POUR GÉRER LES MESSAGES ====================
function addUserMessage(content, fromHistory = false, timestamp = null) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    const time = timestamp ? new Date(timestamp) : new Date();
    const timeString = formatTime(time);
    
    messageDiv.className = `slide-up ${fromHistory ? '' : 'ml-auto'} max-w-[90%] md:max-w-3/4`;
    messageDiv.innerHTML = `
        <div class="flex ${fromHistory ? '' : 'justify-end'}">
            <div class="${fromHistory ? 'bg-gray-800/50' : 'bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8]'} p-2.5 md:p-3 rounded-2xl ${fromHistory ? 'max-w-full' : ''}" style="${fromHistory ? '' : 'border-top-right-radius: 4px;'}">
                <div class="flex items-center justify-between mb-0.5">
                    <span class="text-xs font-medium ${fromHistory ? 'text-gray-400' : 'text-white'}">
                        <i class="mr-1 fas fa-user"></i>Vous
                    </span>
                    <span class="text-xs ${fromHistory ? 'text-gray-500' : 'text-blue-100'}">${timeString}</span>
                </div>
                <p class="text-white whitespace-pre-wrap text-responsive leading-relaxed">${escapeHtml(content)}</p>
                ${!fromHistory && currentCategory ? `
                    <div class="mt-1.5 flex justify-end">
                        <div class="category-badge text-xs" style="background: ${categories[currentCategory]?.color || '#3b82f6'}">
                            <i class="fas ${categories[currentCategory]?.icon || 'fa-tag'}"></i>
                            <span>${categories[currentCategory]?.name?.substring(0, 3) || ''}</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    messagesDiv.appendChild(messageDiv);
    if (!fromHistory) scrollToBottom();
}

function addAIMessage(content, fromHistory = false, timestamp = null) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    const time = timestamp ? new Date(timestamp) : new Date();
    const timeString = formatTime(time);
    
    messageDiv.className = 'slide-up max-w-[90%] md:max-w-3/4';
    messageDiv.innerHTML = `
        <div class="flex items-start space-x-2 md:space-x-3">
            <div class="flex-shrink-0">
                <div class="p-2 md:p-2.5 rounded-full" style="background: ${categories[currentCategory]?.color || '#3b82f6'}">
                    <i class="text-base md:text-lg text-white fas fa-robot"></i>
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-0.5">
                    <span class="text-xs font-medium text-gray-400 truncate">
                        <i class="mr-1 ${categories[currentCategory]?.icon || 'fa-robot'}"></i>
                        ${categories[currentCategory]?.name || 'Assistant'} • Mistral 7B
                    </span>
                    <span class="text-xs text-gray-500 flex-shrink-0 ml-1">${timeString}</span>
                </div>
                <div class="p-2.5 md:p-3 rounded-xl glass-effect">
                    <div class="text-gray-300 whitespace-pre-wrap text-responsive leading-relaxed">${formatResponse(content)}</div>
                </div>
            </div>
        </div>
    `;
    messagesDiv.appendChild(messageDiv);
    if (!fromHistory) scrollToBottom();
}

// ==================== FONCTIONS UTILITAIRES ====================
function clearChat() {
    if (confirm('Voulez-vous vraiment effacer cette conversation ?')) {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = `
            <div class="p-3 md:p-4 lg:p-6 rounded-2xl glass-effect slide-up message-container">
                <div class="flex items-start space-x-3 md:space-x-4">
                    <div class="flex-shrink-0">
                        <div class="p-2 md:p-3 rounded-full" style="background: linear-gradient(135deg, #3b82f6, #2563eb)">
                            <i class="text-lg md:text-xl lg:text-2xl text-white fas fa-robot"></i>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="mb-1.5 md:mb-2 text-base md:text-lg lg:text-xl font-bold text-white">
                            <span class="gradient-edu">Edu</span><span class="gradient-connect">Connect</span> Assistant IA
                        </h3>
                        <p class="text-gray-300 text-responsive">
                            Conversation effacée.
                        </p>
                        <p class="text-white font-medium mt-1.5 mb-1 text-responsive">Pour recommencer :</p>
                        <ol class="ml-4 text-gray-300 text-responsive list-decimal space-y-0.5">
                            <li>Sélectionnez une catégorie ci-dessus</li>
                            <li>Posez votre question dans la zone de texte</li>
                        </ol>
                    </div>
                </div>
            </div>
        `;
        
        if (currentCategory) {
            const category = categories[currentCategory];
            addCategoryMessage(category.name, category.color);
        }
        
        showToast('Conversation effacée', 'warning');
        currentConversationId = null;
    }
}

function formatResponse(text) {
    return escapeHtml(text)
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/^### (.*$)/gm, '<h3 class="text-base md:text-lg font-bold mt-3 mb-1.5 text-white">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-lg md:text-xl font-bold mt-4 mb-2 text-white">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-xl md:text-2xl font-bold mt-5 mb-3 text-white">$1</h1>')
        .replace(/^- (.*$)/gm, '<li class="ml-4 mb-0.5">$1</li>')
        .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-800/70 rounded text-xs md:text-sm font-mono">$1</code>');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(date) {
    if (!date || isNaN(new Date(date))) return '--:--';
    return new Date(date).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
    });
}

function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date)) return '';
    
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) { // Moins d'un jour
        return formatTime(date);
    } else if (diff < 604800000) { // Moins d'une semaine
        return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
}

function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    setTimeout(() => {
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, 100);
}

// ==================== GESTION DU SIDEBAR/HISTORIQUE ====================
function toggleHistory() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (window.innerWidth < 768) {
        // Sur mobile: toggle simple
        if (sidebar.classList.contains('sidebar-mobile-hidden')) {
            sidebar.classList.remove('sidebar-mobile-hidden');
            sidebar.classList.add('sidebar-mobile-show');
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            isHistoryVisible = true;
        } else {
            sidebar.classList.remove('sidebar-mobile-show');
            sidebar.classList.add('sidebar-mobile-hidden');
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
            isHistoryVisible = false;
        }
    } else {
        // Sur desktop: toggle expanded/collapsed
        if (isSidebarExpanded) {
            sidebar.classList.remove('sidebar-expanded');
            sidebar.classList.add('sidebar-collapsed');
            document.querySelectorAll('.sidebar-content-expanded').forEach(el => {
                el.classList.remove('sidebar-content-expanded');
                el.classList.add('sidebar-content-collapsed');
            });
            document.getElementById('sidebarCollapsedContent').classList.remove('sidebar-content-collapsed');
            document.getElementById('sidebarCollapsedContent').classList.add('sidebar-content-expanded');
            document.getElementById('sidebarToggleIcon').className = 'fas fa-chevron-right text-base md:text-lg text-white';
            isSidebarExpanded = false;
        } else {
            sidebar.classList.remove('sidebar-collapsed');
            sidebar.classList.add('sidebar-expanded');
            document.querySelectorAll('.sidebar-content-collapsed').forEach(el => {
                el.classList.remove('sidebar-content-collapsed');
                el.classList.add('sidebar-content-expanded');
            });
            document.getElementById('sidebarCollapsedContent').classList.remove('sidebar-content-expanded');
            document.getElementById('sidebarCollapsedContent').classList.add('sidebar-content-collapsed');
            document.getElementById('sidebarToggleIcon').className = 'fas fa-chevron-left text-base md:text-lg text-white';
            isSidebarExpanded = true;
        }
        isHistoryVisible = isSidebarExpanded;
    }
}

function toggleSidebarSize() {
    if (window.innerWidth >= 768) {
        toggleHistory();
    }
}

// ==================== FONCTIONS POUR LES NOTIFICATIONS ====================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    switch(type) {
        case 'success':
            toastIcon.className = 'fas fa-check-circle';
            break;
        case 'error':
            toastIcon.className = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            toastIcon.className = 'fas fa-exclamation-triangle';
            break;
        default:
            toastIcon.className = 'fas fa-info-circle';
    }
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    // Réinitialiser l'animation
    toast.style.animation = 'none';
    setTimeout(() => {
        toast.style.animation = '';
    }, 10);
    
    setTimeout(() => hideToast(), 4000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('hidden');
}

// ==================== GESTION DU RESPONSIVE ====================
function handleResize() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (window.innerWidth < 768) {
        // Sur mobile: cacher le sidebar par défaut
        sidebar.classList.add('sidebar-mobile-hidden');
        sidebar.classList.remove('sidebar-mobile-show', 'sidebar-collapsed', 'sidebar-expanded');
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
        isHistoryVisible = false;
        
        // Afficher le contenu réduit sur mobile
        document.querySelectorAll('.sidebar-content-collapsed').forEach(el => {
            el.classList.remove('sidebar-content-collapsed');
            el.classList.add('sidebar-content-expanded');
        });
        document.getElementById('sidebarCollapsedContent').classList.add('sidebar-content-collapsed');
        document.getElementById('sidebarCollapsedContent').classList.remove('sidebar-content-expanded');
    } else {
        // Sur desktop: montrer le sidebar
        sidebar.classList.remove('sidebar-mobile-hidden', 'sidebar-mobile-show');
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
        
        if (isSidebarExpanded) {
            sidebar.classList.add('sidebar-expanded');
            sidebar.classList.remove('sidebar-collapsed');
        } else {
            sidebar.classList.add('sidebar-collapsed');
            sidebar.classList.remove('sidebar-expanded');
        }
    }
    
    // Ajuster la hauteur de la zone de messages
    const headerHeight = document.querySelector('header').offsetHeight;
    const categoriesHeight = document.querySelector('.bg-gray-800\\/40').offsetHeight;
    const inputHeight = document.querySelector('.sticky-bottom').offsetHeight;
    const messagesContainer = document.getElementById('messagesContainer');
    
    if (messagesContainer) {
        const availableHeight = window.innerHeight - headerHeight - categoriesHeight - inputHeight;
        messagesContainer.style.maxHeight = `${availableHeight}px`;
    }
}

// Écouter les changements de taille
window.addEventListener('resize', handleResize);
// Initialiser
window.addEventListener('load', handleResize);

// ==================== GESTION DES TOUCHES ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth < 768 && !sidebar.classList.contains('sidebar-mobile-hidden')) {
            toggleHistory();
        }
    }
});

// ==================== GESTION DU CLICK EN DEHORS ====================
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const historyToggle = document.getElementById('historyToggle');
    
    if (window.innerWidth < 768 && 
        !sidebar.contains(e.target) && 
        !historyToggle.contains(e.target) &&
        !sidebar.classList.contains('sidebar-mobile-hidden')) {
        toggleHistory();
    }
});

// ==================== GESTION DU SCROLL ====================
let lastScrollTop = 0;
const header = document.querySelector('header');

document.getElementById('messagesContainer').addEventListener('scroll', () => {
    const scrollTop = document.getElementById('messagesContainer').scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scroll down - hide categories
        document.querySelector('.bg-gray-800\\/40').classList.add('opacity-0', 'scale-y-0', 'h-0', 'p-0', 'border-0');
        document.querySelector('.bg-gray-800\\/40').classList.remove('p-3', 'md:p-4');
    } else if (scrollTop < lastScrollTop) {
        // Scroll up - show categories
        document.querySelector('.bg-gray-800\\/40').classList.remove('opacity-0', 'scale-y-0', 'h-0', 'p-0', 'border-0');
        document.querySelector('.bg-gray-800\\/40').classList.add('p-3', 'md:p-4');
    }
    
    lastScrollTop = scrollTop;
});

// ==================== INITIALISATION FINALE ====================
// Focus sur le champ de saisie quand on clique sur la zone de messages
document.getElementById('messagesContainer').addEventListener('click', () => {
    document.getElementById('prompt').focus();
});

// Empêcher le comportement par défaut du pull-to-refresh sur mobile
document.addEventListener('touchmove', function(e) {
    if (e.touches.length !== 1) return;
    e.preventDefault();
}, { passive: false });

console.log("🚀 Application EduConnect Assistant IA initialisée");
