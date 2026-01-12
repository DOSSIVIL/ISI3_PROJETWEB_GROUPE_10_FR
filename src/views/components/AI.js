  // Configuration de l'API DeepSeek
  const DEEPSEEK_API_KEY = "sk-702c2e402d684805b623d877a47910c7";
  const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
  
  // Configuration des catégories
  const categories = {
      math: {
          name: "Mathématiques",
          description: "Algèbre, géométrie, calcul, statistiques et plus encore",
          icon: "fa-calculator",
          color: "text-blue-600",
          bgColor: "from-blue-50 to-blue-100",
          prompt: "Tu es un tuteur expert en mathématiques. Tu aides les étudiants africains à comprendre les concepts mathématiques. Réponds de manière claire, avec des exemples concrets et adaptés au contexte africain."
      },
      physics: {
          name: "Physique",
          description: "Mécanique, électricité, thermodynamique, optique et plus",
          icon: "fa-atom",
          color: "text-green-600",
          bgColor: "from-green-50 to-green-100",
          prompt: "Tu es un tuteur expert en physique. Tu expliques les concepts physiques de manière simple avec des applications pratiques dans la vie quotidienne en Afrique. Utilise des exemples pertinents."
      },
      earth: {
          name: "Sciences de la Terre",
          description: "Géologie, climatologie, écologie, ressources naturelles",
          icon: "fa-globe-africa",
          color: "text-yellow-600",
          bgColor: "from-yellow-50 to-yellow-100",
          prompt: "Tu es un expert en sciences de la Terre spécialisé sur l'Afrique. Tu parles de géologie africaine, climat, ressources naturelles et environnement. Mets l'accent sur le contexte africain."
      },
      literature: {
          name: "Littérature camerounaise",
          description: "Auteurs, œuvres, littérature francophone et anglophone",
          icon: "fa-book",
          color: "text-purple-600",
          bgColor: "from-purple-50 to-purple-100",
          prompt: "Tu es un expert en littérature camerounaise. Tu connais les auteurs classiques et contemporains, les œuvres majeures et les mouvements littéraires du Cameroun. Parle aussi bien français qu'anglais selon la langue de l'utilisateur."
      },
      computer: {
          name: "Informatique",
          description: "Programmation, réseaux, bases de données, IA",
          icon: "fa-laptop-code",
          color: "text-red-600",
          bgColor: "from-red-50 to-red-100",
          prompt: "Tu es un tuteur en informatique spécialisé pour les étudiants africains. Tu enseignes la programmation, les concepts informatiques avec des exemples pratiques et des conseils pour le marché du travail africain."
      }
  };
  
  // Variables globales
  let currentCategory = null;
  let chatHistory = [];
  let isProcessing = false;
  let dailyStats = {
      messages: 0,
      startTime: new Date()
  };
  
  // Initialisation
  document.addEventListener('DOMContentLoaded', function() {
      updateDailyStats();
      updateOfflineCount();
      loadRecentDiscussions();
      
      // Gestion du dropdown navbar
      const dropdownBtn = document.getElementById('navbarDropdownBtn');
      const dropdown = document.getElementById('navbarDropdown');
      
      let isDropdownOpen = false;
      
      dropdownBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          toggleDropdown();
      });
      
      // Fermer le dropdown en cliquant à l'extérieur
      document.addEventListener('click', function(e) {
          if (isDropdownOpen && !dropdown.contains(e.target) && !dropdownBtn.contains(e.target)) {
              closeDropdown();
          }
      });
      
      function toggleDropdown() {
          isDropdownOpen = !isDropdownOpen;
          if (isDropdownOpen) {
              dropdown.classList.remove('dropdown-closed');
              dropdown.classList.add('dropdown-open');
          } else {
              closeDropdown();
          }
      }
      
      function closeDropdown() {
          isDropdownOpen = false;
          dropdown.classList.remove('dropdown-open');
          dropdown.classList.add('dropdown-closed');
      }
      
      // Exposer pour d'autres fonctions
      window.closeNavbarDropdown = closeDropdown;
  });
  
  // Gestion des catégories
  document.querySelectorAll('.category-card').forEach(btn => {
      btn.addEventListener('click', function() {
          const category = this.dataset.category;
          selectCategory(category);
          
          // Fermer la sidebar sur mobile
          if (window.innerWidth < 1024) {
              closeSidebar();
          }
      });
  });
  
  function selectCategory(category) {
      if (currentCategory === category) return;
      
      // Désactiver toutes les catégories
      document.querySelectorAll('.category-card').forEach(card => {
          card.classList.remove('active');
      });
      
      // Activer la catégorie sélectionnée
      const selectedCard = document.querySelector(`[data-category="${category}"]`);
      selectedCard.classList.add('active');
      
      currentCategory = category;
      const catInfo = categories[category];
      
      // Mettre à jour l'affichage
      document.getElementById('currentCategory').textContent = catInfo.name;
      document.getElementById('categoryDescription').textContent = catInfo.description;
      document.getElementById('categoryIcon').className = `w-12 h-12 rounded-xl bg-linear-to-br ${catInfo.bgColor} flex items-center justify-center border ${catInfo.color.replace('text-', 'border-')}/20`;
      document.getElementById('categoryIcon').innerHTML = `<i class="fas ${catInfo.icon} text-2xl ${catInfo.color}"></i>`;
      
      // Activer la zone de saisie
      document.getElementById('messageInput').disabled = false;
      document.getElementById('sendBtn').disabled = false;
      document.getElementById('inputStatus').innerHTML = `<i class="fas fa-check-circle mr-1 text-africa-green"></i>Prêt à discuter`;
      
      // Afficher le message de bienvenue
      showCategoryWelcome(catInfo);
      
      // Charger l'historique
      loadChatHistory(category);
  }
  
  function showCategoryWelcome(catInfo) {
      const chatContainer = document.getElementById('chatMessages');
      chatContainer.innerHTML = '';
      
      const welcomeMessage = `
          <div class="flex items-start space-x-4 fade-in">
              <div class="w-12 h-12 rounded-xl bg-linear-to-br ${catInfo.bgColor} flex items-center justify-center shrink-0 border ${catInfo.color.replace('text-', 'border-')}/20">
                  <i class="fas ${catInfo.icon} text-2xl ${catInfo.color}"></i>
              </div>
              <div class="flex-1">
                  <div class="message-bubble-ai rounded-2xl p-5">
                      <div class="flex items-center justify-between mb-3">
                          <div class="flex items-center space-x-2">
                              <span class="font-bold text-gray-900">Assistant ${catInfo.name}</span>
                              <span class="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-700 border border-gray-200">
                                  <i class="fas fa-robot mr-1"></i>IA
                              </span>
                          </div>
                          <div class="flex items-center space-x-2">
                              <span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">FR</span>
                              <span class="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">EN</span>
                          </div>
                      </div>
                      <p class="text-gray-700 mb-4">Bonjour ! Je suis votre assistant spécialisé en <span class="font-semibold text-gray-900">${catInfo.name.toLowerCase()}</span>. Je suis ici pour vous aider à comprendre les concepts et répondre à vos questions.</p>
                      <div class="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                          <p class="text-sm font-medium text-gray-900 mb-2 flex items-center">
                              <i class="fas fa-lightbulb mr-2 text-africa-yellow"></i>
                              Exemple de question :
                          </p>
                          <p class="text-gray-600 text-sm">"${getExampleQuestion(currentCategory)}"</p>
                      </div>
                      <div class="flex items-center space-x-2 text-xs text-gray-500">
                          <i class="fas fa-info-circle"></i>
                          <span>Je répondrai automatiquement dans la langue de votre message</span>
                      </div>
                  </div>
              </div>
          </div>
      `;
      
      chatContainer.innerHTML = welcomeMessage;
      updateMessageCount();
  }
  
  function getExampleQuestion(category) {
      const examples = {
          math: "Pouvez-vous expliquer le théorème de Pythagore avec un exemple concret?",
          physics: "Comment fonctionne un panneau solaire et pourquoi est-ce important en Afrique?",
          earth: "Quelles sont les principales ressources naturelles de l'Afrique et comment sont-elles formées?",
          literature: "Quels sont les auteurs camerounais les plus influents et leurs œuvres majeures?",
          computer: "Comment créer un site web simple avec HTML et CSS?"
      };
      return examples[category] || "Posez votre question ici...";
  }
  
  // Gestion des messages
  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  document.getElementById('newChat').addEventListener('click', function() {
      if (currentCategory) {
          showCategoryWelcome(categories[currentCategory]);
          chatHistory = [];
      }
  });
  
  document.getElementById('messageInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
      }
  });
  
  // Compteur de caractères
  document.getElementById('messageInput').addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
      
      const count = this.value.length;
      document.getElementById('charCount').textContent = `${count}/2000`;
      
      if (count > 1900) {
          document.getElementById('charCount').className = 'text-xs text-africa-red';
      } else if (count > 1500) {
          document.getElementById('charCount').className = 'text-xs text-africa-orange';
      } else {
          document.getElementById('charCount').className = 'text-xs text-gray-500';
      }
  });
  
  async function sendMessage() {
      const input = document.getElementById('messageInput');
      const message = input.value.trim();
      
      if (!message || !currentCategory || isProcessing) return;
      if (message.length > 2000) {
          alert("Le message est trop long (max 2000 caractères)");
          return;
      }
      
      // Détecter la langue
      const lang = detectLanguage(message);
      updateLanguageIndicator(lang);
      updateProfileLanguage(lang);
      
      // Ajouter le message au chat
      addMessageToChat(message, 'user', lang);
      input.value = '';
      input.style.height = 'auto';
      document.getElementById('charCount').textContent = '0/2000';
      document.getElementById('charCount').className = 'text-xs text-gray-500';
      
      // Mettre à jour les statistiques
      dailyStats.messages++;
      updateDailyStats();
      
      // Afficher l'indicateur de frappe
      showTypingIndicator();
      
      isProcessing = true;
      document.getElementById('inputStatus').innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i>L'IA réfléchit...`;
      
      try {
          // Préparer l'historique pour l'API
          const messagesForAPI = [
              {
                  role: "system",
                  content: categories[currentCategory].prompt + " Réponds dans la même langue que l'utilisateur. Sois précis, pédagogique et adapté au contexte africain."
              },
              ...chatHistory.slice(-6).map(msg => ({
                  role: msg.role === 'user' ? 'user' : 'assistant',
                  content: msg.content
              })),
              {
                  role: "user",
                  content: message
              }
          ];
          
          // Appel à l'API DeepSeek
          const response = await fetch(DEEPSEEK_API_URL, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
              },
              body: JSON.stringify({
                  model: "deepseek-chat",
                  messages: messagesForAPI,
                  max_tokens: 1500,
                  temperature: 0.7,
                  stream: false
              })
          });
          
          if (!response.ok) {
              throw new Error(`Erreur API: ${response.status}`);
          }
          
          const data = await response.json();
          const aiResponse = data.choices[0].message.content;
          
          // Ajouter la réponse au chat
          removeTypingIndicator();
          addMessageToChat(aiResponse, 'assistant', lang);
          
          // Sauvegarder dans l'historique
          saveToHistory(currentCategory, message, aiResponse, lang);
          
      } catch (error) {
          console.error('Erreur:', error);
          removeTypingIndicator();
          addMessageToChat("Désolé, une erreur s'est produite lors de la connexion à l'IA. Veuillez réessayer ou vérifier votre connexion Internet.", 'assistant', 'fr');
      } finally {
          isProcessing = false;
          document.getElementById('inputStatus').innerHTML = `<i class="fas fa-check-circle mr-1 text-africa-green"></i>Prêt à discuter`;
      }
  }
  
  function addMessageToChat(message, sender, lang) {
      const chatContainer = document.getElementById('chatMessages');
      
      const messageElement = document.createElement('div');
      messageElement.className = `flex items-start space-x-4 fade-in ${sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`;
      
      const avatar = sender === 'user' ? 
          `<div class="w-12 h-12 rounded-xl bg-linear-to-br from-africa-orange to-africa-yellow flex items-center justify-center shrink-0 shadow">
              <i class="fas fa-user text-white"></i>
          </div>` :
          `<div class="w-12 h-12 rounded-xl bg-linear-to-br ${categories[currentCategory]?.bgColor || 'from-gray-50 to-gray-100'} flex items-center justify-center shrink-0 border ${categories[currentCategory]?.color?.replace('text-', 'border-') || 'border-gray-200'}/20">
              <i class="fas ${categories[currentCategory]?.icon || 'fa-robot'} ${categories[currentCategory]?.color || 'text-gray-600'} text-xl"></i>
          </div>`;
      
      const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const langText = lang === 'fr' ? 'Français' : 'English';
      const langColor = lang === 'fr' ? 'blue' : 'red';
      
      const bubble = sender === 'user' ? 
          `<div class="message-bubble-user rounded-2xl p-5 max-w-2xl">
              <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                      <span class="font-bold text-white">Vous</span>
                      <span class="px-2 py-0.5 bg-white/20 text-xs rounded-full text-white">
                          <i class="fas fa-user mr-1"></i>Étudiant
                      </span>
                  </div>
                  <div class="flex items-center space-x-2">
                      <span class="text-xs text-white/90">${time}</span>
                      <span class="px-2 py-0.5 bg-${langColor}-100 text-${langColor}-800 text-xs rounded-full">
                          ${lang === 'fr' ? 'FR' : 'EN'}
                      </span>
                  </div>
              </div>
              <div class="text-white whitespace-pre-wrap">${escapeHtml(message)}</div>
          </div>` :
          `<div class="message-bubble-ai rounded-2xl p-5 max-w-2xl">
              <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                      <span class="font-bold text-gray-900">Assistant IA</span>
                      <span class="px-2 py-0.5 bg-gray-100 text-xs rounded-full text-gray-700 border border-gray-200">
                          <i class="fas ${categories[currentCategory]?.icon || 'fa-robot'} mr-1"></i>${categories[currentCategory]?.name || 'Assistant'}
                      </span>
                  </div>
                  <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500">${time}</span>
                      <span class="px-2 py-0.5 bg-${langColor}-100 text-${langColor}-800 text-xs rounded-full">
                          ${lang === 'fr' ? 'FR' : 'EN'}
                      </span>
                  </div>
              </div>
              <div class="text-gray-700 whitespace-pre-wrap">${escapeHtml(message)}</div>
          </div>`;
      
      messageElement.innerHTML = `${avatar}${bubble}`;
      chatContainer.appendChild(messageElement);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      updateMessageCount();
      
      // Ajouter à l'historique en mémoire
      chatHistory.push({
          role: sender,
          content: message,
          lang: lang,
          timestamp: new Date().toISOString()
      });
  }
  
  function detectLanguage(text) {
      // Détection simple basée sur des mots clés
      const frenchWords = ['le', 'la', 'les', 'un', 'une', 'des', 'est', 'et', 'à', 'dans', 'pour'];
      const englishWords = ['the', 'a', 'an', 'is', 'and', 'to', 'in', 'of', 'for', 'with'];
      
      const words = text.toLowerCase().split(/\s+/);
      let frenchCount = 0, englishCount = 0;
      
      words.forEach(word => {
          if (frenchWords.includes(word)) frenchCount++;
          if (englishWords.includes(word)) englishCount++;
      });
      
      return frenchCount >= englishCount ? 'fr' : 'en';
  }
  
  function showTypingIndicator() {
      const chatContainer = document.getElementById('chatMessages');
      const typingElement = document.createElement('div');
      typingElement.className = 'flex items-start space-x-4 fade-in';
      typingElement.id = 'typingIndicator';
      typingElement.innerHTML = `
          <div class="w-12 h-12 rounded-xl bg-linear-to-br ${categories[currentCategory]?.bgColor || 'from-gray-50 to-gray-100'} flex items-center justify-center shrink-0 border ${categories[currentCategory]?.color?.replace('text-', 'border-') || 'border-gray-200'}/20">
              <i class="fas ${categories[currentCategory]?.icon || 'fa-robot'} ${categories[currentCategory]?.color || 'text-gray-600'} text-xl"></i>
          </div>
          <div class="message-bubble-ai rounded-2xl p-5">
              <div class="flex items-center space-x-2 mb-2">
                  <span class="font-medium text-gray-700">L'IA réfléchit</span>
                  <div class="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                  </div>
              </div>
              <p class="text-sm text-gray-500">Je prépare une réponse adaptée à votre question...</p>
          </div>
      `;
      chatContainer.appendChild(typingElement);
      chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  function removeTypingIndicator() {
      const typingIndicator = document.getElementById('typingIndicator');
      if (typingIndicator) {
          typingIndicator.remove();
      }
  }
  
  function updateMessageCount() {
      const chatContainer = document.getElementById('chatMessages');
      const messageCount = chatContainer.querySelectorAll('.fade-in').length;
      document.getElementById('messageCount').textContent = messageCount;
  }
  
  function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
  }
  
  // Gestion de l'historique
  function saveToHistory(category, userMessage, aiResponse, lang) {
      const history = JSON.parse(localStorage.getItem('educonnect_chat_history') || '{}');
      
      if (!history[category]) {
          history[category] = [];
      }
      
      history[category].push({
          user: userMessage,
          ai: aiResponse,
          lang: lang,
          timestamp: new Date().toISOString(),
          category: category
      });
      
      // Limiter à 100 conversations par catégorie
      if (history[category].length > 100) {
          history[category] = history[category].slice(-100);
      }
      
      localStorage.setItem('educonnect_chat_history', JSON.stringify(history));
      updateRecentDiscussions();
      updateOfflineCount();
      updateTotalDiscussions();
  }
  
  function loadChatHistory(category) {
      const history = JSON.parse(localStorage.getItem('educonnect_chat_history') || '{}');
      chatHistory = [];
      
      if (history[category]) {
          history[category].forEach(conv => {
              chatHistory.push({
                  role: 'user',
                  content: conv.user,
                  lang: conv.lang
              });
              chatHistory.push({
                  role: 'assistant',
                  content: conv.ai,
                  lang: conv.lang
              });
          });
      }
  }
  
  function updateRecentDiscussions() {
      const history = JSON.parse(localStorage.getItem('educonnect_chat_history') || '{}');
      const container = document.getElementById('recentDiscussions');
      
      if (Object.keys(history).length === 0) {
          container.innerHTML = `
              <div class="p-4 text-center text-gray-500 text-sm">
                  <i class="fas fa-comment-slash text-2xl mb-2 text-gray-400"></i>
                  <p>Aucune discussion récente</p>
                  <p class="text-xs mt-1">Commencez une nouvelle conversation</p>
              </div>
          `;
          return;
      }
      
      let allConversations = [];
      Object.entries(history).forEach(([category, conversations]) => {
          conversations.forEach(conv => {
              allConversations.push({
                  ...conv,
                  category: category
              });
          });
      });
      
      // Trier par date (du plus récent au plus ancien)
      allConversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Prendre les 5 plus récentes
      const recentConversations = allConversations.slice(0, 5);
      
      let html = '';
      recentConversations.forEach(conv => {
          const date = new Date(conv.timestamp);
          const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
          const catInfo = categories[conv.category];
          
          html += `
              <div class="p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition m-2 border border-gray-100" onclick="selectCategory('${conv.category}'); closeNavbarDropdown();">
                  <div class="flex items-start space-x-3">
                      <div class="w-10 h-10 rounded-lg bg-linear-to-br ${catInfo?.bgColor || 'from-gray-50 to-gray-100'} flex items-center justify-center shrink-0 border ${catInfo?.color?.replace('text-', 'border-') || 'border-gray-200'}/20">
                          <i class="fas ${catInfo?.icon || 'fa-comment'} ${catInfo?.color || 'text-gray-500'}"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                          <div class="flex justify-between items-start">
                              <div>
                                  <div class="font-medium text-sm text-gray-900 truncate">${catInfo?.name || conv.category}</div>
                                  <div class="text-xs text-gray-600 truncate">${conv.user.substring(0, 60)}${conv.user.length > 60 ? '...' : ''}</div>
                              </div>
                              <div class="flex flex-col items-end">
                                  <span class="text-xs text-gray-500">${timeStr}</span>
                                  <span class="text-xs text-gray-500">${dateStr}</span>
                              </div>
                          </div>
                          <div class="flex items-center space-x-2 mt-2">
                              <span class="px-2 py-0.5 text-xs ${conv.lang === 'fr' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-red-50 text-red-700 border border-red-100'} rounded-full">
                                  ${conv.lang === 'fr' ? 'FR' : 'EN'}
                              </span>
                              <span class="text-xs text-gray-500">
                                  <i class="fas fa-reply mr-1"></i>${conv.ai.length > 100 ? 'Longue réponse' : 'Courte réponse'}
                              </span>
                          </div>
                      </div>
                  </div>
              </div>
          `;
      });
      
      container.innerHTML = html;
  }
  
  function loadRecentDiscussions() {
      updateRecentDiscussions();
      updateTotalDiscussions();
  }
  
  // Mise à jour des indicateurs
  function updateLanguageIndicator(lang) {
      const indicator = document.getElementById('langIndicator');
      indicator.innerHTML = `
          <span class="px-2 py-0.5 ${lang === 'fr' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'} rounded text-xs font-medium">
              ${lang === 'fr' ? 'FR' : 'EN'}
          </span>
      `;
  }
  
  function updateProfileLanguage(lang) {
      document.getElementById('profileLang').textContent = lang === 'fr' ? 'Français' : 'English';
  }
  
  function updateTotalDiscussions() {
      const history = JSON.parse(localStorage.getItem('educonnect_chat_history') || '{}');
      let total = 0;
      Object.values(history).forEach(convs => {
          total += convs.length;
      });
      document.getElementById('totalDiscussions').textContent = total;
  }
  
  function updateOfflineCount() {
      const history = JSON.parse(localStorage.getItem('educonnect_chat_history') || '{}');
      let total = 0;
      Object.values(history).forEach(convs => {
          total += convs.length;
      });
      document.getElementById('offlineCount').textContent = total;
  }
  
  function updateDailyStats() {
      document.getElementById('dailyMessages').textContent = dailyStats.messages;
      
      const now = new Date();
      const diffMinutes = Math.floor((now - dailyStats.startTime) / 60000);
      document.getElementById('dailyTime').textContent = diffMinutes;
  }
  
  // Effacer le chat
  document.getElementById('clearChat').addEventListener('click', function() {
      if (!currentCategory) return;
      
      if (confirm("Voulez-vous effacer l'historique de cette conversation?")) {
          chatHistory = [];
          showCategoryWelcome(categories[currentCategory]);
      }
  });
  
  // Gestion de la sidebar mobile
  document.getElementById('sidebarToggle').addEventListener('click', function() {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('overlay');
      
      sidebar.classList.toggle('hidden');
      overlay.classList.toggle('hidden');
  });
  
  document.getElementById('overlay').addEventListener('click', closeSidebar);
  
  function closeSidebar() {
      document.getElementById('sidebar').classList.add('hidden');
      document.getElementById('overlay').classList.add('hidden');
  }
  
  // Microphone (simulation)
  document.getElementById('micBtn').addEventListener('click', function() {
      alert("🎤 Fonctionnalité microphone en développement");
  });
  
  // Attacher des fichiers (simulation)
  document.getElementById('attachBtn').addEventListener('click', function() {
      alert("📎 Fonctionnalité d'attachement en développement");
  });
  
  // Exposer certaines fonctions globalement
  window.selectCategory = selectCategory;
  window.closeNavbarDropdown = function() {
      const dropdown = document.getElementById('navbarDropdown');
      dropdown.classList.remove('dropdown-open');
      dropdown.classList.add('dropdown-closed');
  };