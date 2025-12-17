import { Utilisateur } from "./Utilisateur.model.js";

export class Tuteur extends Utilisateur {
  constructor(data = {}) {
    super(data);
    this.motDePasse = data.motDePasse || "";
    this.specialite = data.specialite || "";
    this.grade = data.grade || "";
    this.status = data.status || false;
    this.typeUtilisateur = "tuteur";
  }

  toFirestore() {
    return {
      ...super.toFirestore(),
      specialite: this.specialite,
      grade: this.grade,
      status: this.status,
    };
  }
}
