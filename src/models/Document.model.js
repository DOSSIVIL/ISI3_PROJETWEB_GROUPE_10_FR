export class Document {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nom = data.nom || "";
    this.dateCreation = data.dateCreation || new Date();
    this.type = data.type || ""; // pdf, image, etc.
    this.url = data.url || ""; // si stocké dans Firebase Storage
    this.proprietaireId = data.proprietaireId || null; // qui l'a soumis
  }

  toFirestore() {
    return {
      nom: this.nom,
      dateCreation: this.dateCreation,
      type: this.type,
      url: this.url,
      proprietaireId: this.proprietaireId,
    };
  }
}
