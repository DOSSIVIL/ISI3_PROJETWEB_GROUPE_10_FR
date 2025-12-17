export class AssistantIA {
  constructor(data = {}) {
    this.id = data.id || null;
    this.date = data.date || new Date();
    this.categorie = data.categorie || "";
    this.langue = data.langue || "fr";
    // Peut-être un contenu ou réponse IA ?
    this.reponse = data.reponse || "";
    this.etudiantId = data.etudiantId || null;
  }

  toFirestore() {
    return {
      date: this.date,
      categorie: this.categorie,
      langue: this.langue,
      reponse: this.reponse,
      etudiantId: this.etudiantId,
    };
  }
}
