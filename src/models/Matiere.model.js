export class Matiere {
  constructor(data = {}) {
    this.id = data.id || null;
    this.intitule = data.intitule || "";
    this.categorie = data.categorie || "";
  }

  toFirestore() {
    return {
      intitule: this.intitule,
      categorie: this.categorie,
    };
  }
}
