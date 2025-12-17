export class Message {
  constructor(data = {}) {
    this.id = data.id || null;
    this.contenu = data.contenu || "";
    this.statut = data.statut || false;
    this.dateEnvoi = data.dateEnvoi || new Date();
    this.envoyeurId = data.envoyeurId || null;
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
