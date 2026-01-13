// src/Controller/assistantAiController.js

import { AssistantIAService } from "../Service/assistant_aiService.js";
import { auth } from "../firebase/firebase-config.js";
import { AssistantIA } from "../models/Assistant_ia.model.js";
import { AssistantIAView } from "../views/assistantAiView.js";

export class AssistantIAController {
  constructor(container) {
    this.container = container;
    this.view = new AssistantIAView(container);
    this.service = new AssistantIAService();
    this.etudiantId = null;
    this.currentUser = null;
    this.messages = [];
    this.unsubscribe = null;

    // Bind des méthodes
    this.handleUserRequest = this.handleUserRequest.bind(this);
    this.handleAuthStateChanged = this.handleAuthStateChanged.bind(this);
  }

  async init() {
    try {
      // 1. Attendre l'authentification
      await this.setupAuthentication();

      // 2. Initialiser la vue avec les callbacks
      this.view.render([]);

      // 3. Configurer les callbacks de la vue
      this.view.onSendMessage = this.handleUserRequest;

      // 4. Charger l'historique en temps réel
      this.loadHistory();
    } catch (error) {
      console.error("Erreur initialisation:", error);
      this.showErrorMessage("Impossible de charger l'assistant IA");
    }
  }

  // GESTION AUTHENTIFICATION
  async setupAuthentication() {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          this.currentUser = user;
          this.etudiantId = user.uid;
          resolve();
        } else {
          reject(new Error("Utilisateur non authentifié"));
          // Rediriger vers la page de connexion
          window.location.hash = "#/connexion";
        }
      });

      // Timeout après 10 secondes
      setTimeout(() => {
        unsubscribe();
        reject(new Error("Timeout d'authentification"));
      }, 10000);
    });
  }

  handleAuthStateChanged(user) {
    if (user) {
      this.currentUser = user;
      this.etudiantId = user.uid;
      this.loadHistory();
    } else {
      this.messages = [];
      this.view.render([]);
      window.location.hash = "#/connexion";
    }
  }

  // CHARGER L'HISTORIQUE
  loadHistory() {
    if (this.unsubscribe) {
      this.unsubscribe(); // Désabonner l'écoute précédente
    }

    if (!this.etudiantId) return;

    this.unsubscribe = this.service.getHistory(this.etudiantId, (messages) => {
      this.messages = messages;
      this.view.render(messages);
      this.scrollToBottom();
    });
  }

  // GÉRER UNE REQUÊTE UTILISATEUR
  async handleUserRequest(text) {
    if (!text?.trim()) return;

    // Ajouter le message utilisateur immédiatement (optimistic update)
    const userMessage = new AssistantIA({
      question: text,
      reponse: "En train de réfléchir...",
      etudiantId: this.etudiantId,
      date: new Date(),
    });

    this.messages.push(userMessage);
    this.view.render(this.messages);
    this.view.showLoading();
    this.scrollToBottom();

    try {
      // 1. Récupérer le contexte utilisateur
      const context = await this.service.getUserContext(this.etudiantId);

      // 2. Appeler l'IA
      const aiResponse = await this.service.callAI(text, context);

      // 3. Mettre à jour le message
      userMessage.reponse = aiResponse;

      // 4. Sauvegarder dans Firestore
      await this.service.saveInteraction(userMessage);

      // 5. Rafraîchir la vue
      this.view.render(this.messages);
      this.scrollToBottom();
    } catch (error) {
      console.error("Erreur:", error);

      // Message d'erreur
      userMessage.reponse = "❌ Désolé, une erreur est survenue. Réessayez.";
      this.view.render(this.messages);
    } finally {
      this.view.removeLoading();
    }
  }

  // SCROLL VERS LE BAS
  scrollToBottom() {
    setTimeout(() => {
      const chatContainer = this.container.querySelector("#chat-messages");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  // AFFICHER UNE ERREUR
  showErrorMessage(message) {
    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-screen p-8 text-center">
        <i class="mb-4 text-4xl text-red-500 fas fa-exclamation-triangle"></i>
        <h2 class="mb-2 text-xl font-bold">Erreur</h2>
        <p class="text-gray-400">${message}</p>
        <button onclick="location.reload()" 
                class="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          Réessayer
        </button>
      </div>
    `;
  }

  // NETTOYAGE
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.view = null;
    this.service = null;
  }
}

// Juni@r02
