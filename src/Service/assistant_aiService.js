import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "../firebase/firebase-config.js";

export class AssistantIAService {
  constructor() {
    this.collectionName = "assistantIA";
    this.apiKey = "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";
  }

  // APPEL À L'API IA avec contexte amélioré
  async callAI(prompt, context = {}) {
    try {
      const systemPrompt = `Tu es un assistant pédagogique intelligent pour la plateforme EduConnect.
      Ton rôle est d'aider les étudiants dans leur apprentissage.
      
      Contexte utilisateur:
      - Matières suivies: ${context.subjects?.join(", ") || "Non spécifié"}
      - Niveau: ${context.level || "Non spécifié"}
      
      Règles de réponse:
      1. Sois pédagogique et encourageant
      2. Explique les concepts de manière simple
      3. Propose des exemples concrets
      4. Reste dans le domaine éducatif
      5. Réponds en français`;

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Erreur API Groq:", error);
      return "Désolé, je rencontre des difficultés techniques. Réessayez dans quelques instants.";
    }
  }

  // SAUVEGARDER l'interaction avec timestamp Firestore
  async saveInteraction(interaction) {
    try {
      const colRef = collection(db, this.collectionName);
      const firestoreData = {
        ...interaction.toFirestore(),
        timestamp: Date.now(), // Pour le tri côté client
      };

      const docRef = await addDoc(colRef, firestoreData);
      return docRef.id;
    } catch (error) {
      console.error("Erreur sauvegarde Firestore:", error);
      throw error;
    }
  }

  // ÉCOUTER l'historique avec limite
  getHistory(etudiantId, callback, limitCount = 50) {
    const q = query(
      collection(db, this.collectionName),
      where("etudiantId", "==", etudiantId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => {
          const data = doc.data();
          return new AssistantIA({
            id: doc.id,
            ...data,
            date: data.date?.toDate() || new Date(),
          });
        });

        // Inverser l'ordre pour afficher du plus ancien au plus récent
        callback(messages.reverse());
      },
      (error) => {
        console.error("Erreur écoute Firestore:", error);
      }
    );
  }

  // NOUVEAU: Récupérer le contexte utilisateur
  async getUserContext(userId) {
    try {
      // Ici, vous devrez récupérer les infos utilisateur depuis votre base
      // Par exemple depuis la collection 'users' ou 'etudiants'
      return {
        subjects: ["Mathématiques", "Physique"],
        level: "Terminale",
        userId: userId,
      };
    } catch (error) {
      console.error("Erreur récupération contexte:", error);
      return {};
    }
  }

  // NOUVEAU: Supprimer un message
  async deleteMessage(messageId) {
    // À implémenter si besoin
  }

  // NOUVEAU: Récupérer les suggestions fréquentes
  async getFrequentQuestions(userId) {
    // Logique pour suggérer des questions basées sur l'historique
    return [
      "Peux-tu m'expliquer le théorème de Pythagore?",
      "Comment résoudre une équation du second degré?",
      "Quelle est la différence entre vitesse et accélération?",
    ];
  }
}
