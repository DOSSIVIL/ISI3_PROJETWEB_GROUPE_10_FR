import { Utilisateur } from "./Utilisateur.model.js";

export class Etudiant extends Utilisateur {
  constructor(data = {}) {
    super(data);
    this.filiere = data.filiere || "";
    this.niveau = data.niveau || "";
    this.motDePasse = data.motDePasse || ""; // Même remarque
    this.typeUtilisateur = "etudiant";
  }

  toFirestore() {
    return {
      ...super.toFirestore(),
      filiere: this.filiere,
      niveau: this.niveau,
    };
  }
}
