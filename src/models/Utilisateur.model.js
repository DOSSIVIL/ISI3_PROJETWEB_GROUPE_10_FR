export class Utilisateur {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nom = data.nom || "";
    this.prenom = data.prenom || "";
    this.email = data.email || "";
    this.telephone = data.telephone || "";
    this.langue = data.langue || "fr";
    this.typeUtilisateur = data.typeUtilisateur || "utilisateur";
    this.sexe = data.sexe || "";
    this.dateCreation = data.dateCreation || new Date();
    this.matieresIds = data.matieresIds || [];
  }

  get nomComplet() {
    return `${this.prenom} ${this.nom}`;
  }

  toFirestore() {
    return {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      telephone: this.telephone,
      langue: this.langue,
      typeUtilisateur: this.typeUtilisateur,
      sexe: this.sexe,
      dateCreation: this.dateCreation,
      matieresIds: this.matieresIds,
    };
  }
}
