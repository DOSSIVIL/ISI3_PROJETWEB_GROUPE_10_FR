// Gestion de la page de chat
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer les paramètres d'URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || 'general';
    const topic = urlParams.get('topic') || 'discussion';
    
    // Données des sujets
    const topicsData = {
        math: {
            algebre: {
                title: "Algèbre Linéaire",
                description: "Discussion sur les matrices, espaces vectoriels, valeurs propres et vecteurs propres."
            },
            analyse: {
                title: "Analyse Complexe",
                description: "Échanges sur les fonctions holomorphes, intégrales complexes et théorème des résidus."
            }
        },
        physique: {
            mecanique: {
                title: "Mécanique Quantique",
                description: "Débats sur l'équation de Schrödinger, le principe d'incertitude et la physique quantique."
            },
            relativite: {
                title: "Relativité Générale",
                description: "Discussion sur l'espace-temps courbe, les équations d'Einstein et les trous noirs."
            }
        },
        terre: {
            geologie: {
                title: "Géologie Africaine",
                description: "Échanges sur les formations géologiques et ressources minières de l'Afrique."
            },
            climat: {
                title: "Climatologie Tropicale",
                description: "Discussions sur les changements climatiques et phénomènes météorologiques en Afrique."
            }
        },
        litterature: {
            classiques: {
                title: "Auteurs Classiques Camerounais",
                description: "Analyse des œuvres de Mongo Beti, Ferdinand Oyono et autres classiques."
            },
            contemporains: {
                title: "Écrivains Contemporains",
                description: "Discussion sur les nouvelles tendances littéraires au Cameroun."
            }
        },
        informatique: {
            web: {
                title: "Développement Web",
                description: "Échanges sur HTML, CSS, JavaScript et frameworks modernes."
            },
            ia: {
                title: "Intelligence Artificielle",
                description: "Discussions sur le Machine Learning, Deep Learning et applications en Afrique."
            }
        }
    };
    
    // Mettre à jour le titre et la description
    const chatTitle = document.getElementById('chatTitle');
    const chatTitleMobile = document.getElementById('chatTitleMobile');
    const chatDescription = document.getElementById('chatDescription');
    
    const topicData = topicsData[category]?.[topic] || {
        title: "Discussion Générale",
        description: "Rejoignez la conversation avec d'autres étudiants passionnés"
    };
    
    if (chatTitle) chatTitle.textContent = topicData.title;
    if (chatTitleMobile) chatTitleMobile.textContent = topicData.title;
    if (chatDescription) chatDescription.textContent = topicData.description;
    
    // Messages de démonstration
    const demoMessages = [
        {
            id: 1,
            sender: "Marie K.",
            content: "Bonjour à tous ! J'ai du mal avec le théorème spectral en algèbre linéaire, quelqu'un peut m'expliquer ?",
            time: "10:30",
            sent: false
        },
        {
            id: 2,
            sender: "Paul T.",
            content: "Je peux t'aider ! Le théorème spectral dit que toute matrice symétrique réelle est diagonalisable par une matrice orthogonale.",
            time: "10:35",
            sent: true
        },
        {
            id: 3,
            sender: "Fatou D.",
            content: "Merci Paul ! J'avais aussi des difficultés avec ce concept. As-tu des exercices pratiques à recommander ?",
            time: "10:40",
            sent: false
        },
        {
            id: 4,
            sender: "Jean M.",
            content: "Je vous recommande le livre 'Algèbre Linéaire et Applications' de David Lay, il a d'excellents exercices.",
            time: "10:45",
            sent: false
        },
        {
            id: 5,
            sender: "Vous",
            content: "Super, merci pour les recommandations ! Je vais regarder ça.",
            time: "Maintenant",
            sent: true
        }
    ];
    
    // Afficher les messages
    const chatMessages = document.getElementById('chatMessages');
    
    function displayMessages() {
        if (!chatMessages) return;
        
        chatMessages.innerHTML = '';
        
        demoMessages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `flex ${msg.sent ? 'justify-end' : 'justify-start'}`;
            
            messageDiv.innerHTML = `
                <div class="message-bubble ${msg.sent ? 'message-sent' : 'message-received'} max-w-md">
                    ${!msg.sent ? `<div class="font-semibold text-sm mb-1">${msg.sender}</div>` : ''}
                    <div class="mb-1">${msg.content}</div>
                    <div class="text-xs opacity-75 text-right">${msg.time}</div>
                </div>
            `;
            
            chatMessages.appendChild(messageDiv);
        });
        
        // Scroller vers le bas
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Initialiser les messages
    setTimeout(displayMessages, 500);
    
    // Gestion de l'envoi de messages
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessage');
    const charCount = document.getElementById('charCount');
    
    if (messageInput && charCount) {
        messageInput.addEventListener('input', function() {
            charCount.textContent = this.value.length;
            
            if (this.value.length > 490) {
                charCount.classList.add('text-red-500');
            } else {
                charCount.classList.remove('text-red-500');
            }
        });
    }
    
    if (sendButton && messageInput) {
        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    function sendMessage() {
        const content = messageInput.value.trim();
        
        if (!content) {
            messageInput.focus();
            return;
        }
        
        // Ajouter le message (simulation)
        const newMessage = {
            id: demoMessages.length + 1,
            sender: "Vous",
            content: content,
            time: "À l'instant",
            sent: true
        };
        
        demoMessages.push(newMessage);
        displayMessages();
        
        // Réinitialiser l'input
        messageInput.value = '';
        charCount.textContent = '0';
        
        // Simuler une réponse automatique après 2 secondes
        setTimeout(() => {
            const autoReply = {
                id: demoMessages.length + 1,
                sender: "Assistant IA",
                content: "Merci pour votre contribution ! N'hésitez pas à poser d'autres questions ou à partager des ressources.",
                time: "À l'instant",
                sent: false
            };
            
            demoMessages.push(autoReply);
            displayMessages();
        }, 2000);
    }
    
    // Gestion des fichiers joints
    const attachFileBtn = document.getElementById('attachFile');
    const fileInput = document.getElementById('fileInput');
    const attachedFiles = document.getElementById('attachedFiles');
    const fileList = document.getElementById('fileList');
    const recordAudioBtn = document.getElementById('recordAudio');
    
    let files = [];
    
    if (attachFileBtn && fileInput) {
        attachFileBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', function() {
            files = Array.from(this.files);
            updateFileList();
        });
    }
    
    function updateFileList() {
        if (files.length > 0) {
            attachedFiles.classList.remove('hidden');
            fileList.innerHTML = '';
            
            files.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg text-xs flex items-center';
                
                let icon = 'fa-file';
                if (file.type.startsWith('image/')) icon = 'fa-file-image';
                else if (file.type.startsWith('audio/')) icon = 'fa-file-audio';
                else if (file.type.includes('pdf')) icon = 'fa-file-pdf';
                
                fileItem.innerHTML = `
                    <i class="fas ${icon} mr-2 text-gray-500"></i>
                    <span class="truncate max-w-xs">${file.name}</span>
                    <button onclick="removeFile(${index})" class="ml-2 text-red-500 hover:text-red-700">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                fileList.appendChild(fileItem);
            });
        } else {
            attachedFiles.classList.add('hidden');
        }
    }
    
    // Fonction pour supprimer un fichier (accessible globalement)
    window.removeFile = function(index) {
        files.splice(index, 1);
        updateFileList();
    };
    
    // Gestion de l'enregistrement audio
    if (recordAudioBtn) {
        recordAudioBtn.addEventListener('click', function() {
            alert("Fonctionnalité d'enregistrement audio à implémenter");
        });
    }
    
    // Afficher une notification de bienvenue
    console.log(`Bienvenue dans la discussion : ${topicData.title}`);
});