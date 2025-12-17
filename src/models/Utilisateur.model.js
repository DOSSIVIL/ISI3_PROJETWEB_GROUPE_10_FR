export class Utilisateur {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nom = data.nom || "";
    this.prenom = data.prenom || "";
    this.email = data.email || "";
    this.telephone = data.telephone || "";
    this.langue = data.langue || "fr"; // par défaut français ?
    this.typeUtilisateur = data.typeUtilisateur || "utilisateur"; // 'etudiant', 'tuteur', etc.
    this.sexe = data.sexe || "";
    this.dateCreation = data.dateCreation || new Date();
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
    };
  }
}
