export class Message {
  constructor(data = {}) {
    this.id = data.id || null;
    this.contenu = data.contenu || "";
    this.statut = data.statut || false; // boolean lu/non lu ?
    this.dateEnvoi = data.dateEnvoi || new Date();
    this.envoyeurId = data.envoyeurId || null; // utilisateur qui envoie
    this.destinataireId = data.destinataireId || null;
  }

  toFirestore() {
    return {
      contenu: this.contenu,
      statut: this.statut,
      dateEnvoi: this.dateEnvoi,
      envoyeurId: this.envoyeurId,
      destinataireId: this.destinataireId,
    };
  }
}
