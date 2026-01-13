// src/controllers/MatiereController.js (ou ton chemin)

import { Matiere } from "../models/Matiere.model.js";
import matiereService from "../Service/matiereService.js"; // ← sans {} → compatible export default
import { MatiereView } from "../views/MatiereView.js";

export class MatiereController {
  constructor(container) {
    this.view = new MatiereView(container);
    this.matieres = [];
    this.editingId = null;

    // Connexion view ↔ controller
    this.view.onCreate = (data) => this.create(data);
    this.view.onUpdate = (id, data) => this.updateOrCancel(id, data);
    this.view.onDelete = (id) => this.delete(id);
    this.view.onEditRequest = (id) => this.startEdit(id);
  }

  async init() {
    await this.loadAll();
  }

  async loadAll() {
    try {
      this.matieres = await matiereService.getAll();
      this.view.render(this.matieres, this.editingId);
    } catch (err) {
      console.error("Erreur lors du chargement des matières :", err);
      this.view.showError("Erreur lors du chargement des matières");
    }
  }

  async create(formData) {
    try {
      const matiere = new Matiere(formData);
      const validation = matiere.validate();

      if (!validation.isValid) {
        this.view.showError(validation.errors.join("\n"));
        return;
      }

      await matiereService.create(matiere.toFirestore());
      await this.loadAll();
      this.view.clearForm();
    } catch (err) {
      console.error("Erreur création matière :", err);
      this.view.showError("Échec de la création");
    }
  }

  startEdit(id) {
    this.editingId = id;
    const matiere = this.matieres.find((m) => m.id === id);
    if (matiere) {
      this.view.render(this.matieres, this.editingId);
      this.view.fillForm(matiere);
    }
  }

  async updateOrCancel(id, formData) {
    // Annulation
    if (!id || !formData) {
      this.editingId = null;
      this.view.render(this.matieres, null);
      this.view.clearForm();
      return;
    }

    try {
      const original = this.matieres.find((m) => m.id === id);
      if (!original) return;

      const updated = original.cloneWith(formData);
      const validation = updated.validate();

      if (!validation.isValid) {
        this.view.showError(validation.errors.join("\n"));
        return;
      }

      await matiereService.update(id, updated.toFirestore());
      await this.loadAll();
      this.editingId = null;
      this.view.clearForm();
    } catch (err) {
      console.error("Erreur mise à jour matière :", err);
      this.view.showError("Échec de la modification");
    }
  }

  async delete(id) {
    try {
      await matiereService.delete(id);
      await this.loadAll();
      if (this.editingId === id) {
        this.editingId = null;
      }
    } catch (err) {
      console.error("Erreur suppression matière :", err);
      this.view.showError("Échec de la suppression");
    }
  }
}
