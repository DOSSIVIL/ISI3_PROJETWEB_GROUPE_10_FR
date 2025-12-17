export class Seance {
  constructor(data = {}) {
    this.id = data.id || null;
    this.dateSeance = data.dateSeance || null; // Date object
    this.heureDebut = data.heureDebut || "";
    this.heureFin = data.heureFin || "";
    this.typeSeance = data.typeSeance || "";
    // Relations : tu stockeras probablement les IDs
    this.etudiantId = data.etudiantId || null;
    this.tuteurId = data.tuteurId || null;
    this.matiereId = data.matiereId || null;
  }

  toFirestore() {
    return {
      dateSeance: this.dateSeance,
      heureDebut: this.heureDebut,
      heureFin: this.heureFin,
      typeSeance: this.typeSeance,
      etudiantId: this.etudiantId,
      tuteurId: this.tuteurId,
      matiereId: this.matiereId,
    };
  }
}
