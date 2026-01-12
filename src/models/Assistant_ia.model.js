export class AssistantIA {
  constructor(data = {}) {
    this.id = data.id || null;
    this.date = data.date || new Date();
    this.question = data.question || "";
    this.reponse = data.reponse || "";
    this.etudiantId = data.etudiantId || null;
  }

  toFirestore() {
    return {
      date: this.date,
      question: this.question,
      reponse: this.reponse,
      etudiantId: this.etudiantId,
    };
  }
}
