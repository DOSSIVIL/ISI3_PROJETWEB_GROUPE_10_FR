// src/views/MatiereView.js

export class MatiereView {
  constructor(containerElement) {
    this.container = containerElement;
    this.onCreate = null;
    this.onUpdate = null;
    this.onDelete = null;
    this.onEditRequest = null;
  }

  render(matieres = [], editingId = null) {
    const isEditing = !!editingId;

    const html = `
      <div class="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
        <div class="max-w-4xl mx-auto">
          <!-- Titre avec gradient -->
          <div class="text-center mb-8">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold bg-linear-to-r from-yellow-500 to-pink-500 bg-clip-text text-transparent mb-3">
              Gestion des Matières
            </h1>
            <p class="text-gray-600 text-base sm:text-lg">
              Ajoutez, modifiez ou supprimez les matières enseignées
            </p>
          </div>

          <form id="matiere-form" class="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 mb-10">
            <input type="hidden" id="matiere-id" value="${editingId || ""}">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Intitulé -->
              <div>
                <label for="intitule" class="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <i class="fas fa-book-open text-yellow-500 mr-2"></i>
                  Intitulé de la matière
                </label>
                <input 
                  type="text" 
                  id="intitule" 
                  required 
                  minlength="3"
                  class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all input-focus bg-gray-50"
                  placeholder="Ex: Mathématiques avancées"
                >
              </div>

              <!-- Catégorie -->
              <div>
                <label for="categorie" class="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <i class="fas fa-tags text-pink-500 mr-2"></i>
                  Catégorie
                </label>
                <select 
                  id="categorie" 
                  required
                  class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all bg-gray-50 appearance-none cursor-pointer"
                >
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Physique-Chimie">Physique-Chimie</option>
                  <option value="SVT">SVT</option>
                  <option value="Français">Français</option>
                  <option value="Histoire-Géo">Histoire-Géo</option>
                  <option value="Langues">Langues</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Autres">Autres</option>
                </select>
              </div>
            </div>

            <!-- Messages d'erreur / succès -->
            <div id="form-error" class="mt-4 text-red-600 text-sm hidden font-medium bg-red-50 p-3 rounded-xl border border-red-200"></div>
            <div id="form-success" class="mt-4 text-green-600 text-sm hidden font-medium bg-green-50 p-3 rounded-xl border border-green-200"></div>

            <!-- Boutons -->
            <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
              <button 
                type="button" 
                id="cancel-edit" 
                class="${
                  isEditing ? "block" : "hidden"
                } px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
              >
                <i class="fas fa-times mr-2"></i>Annuler
              </button>
              
              <button 
                type="submit" 
                class="px-8 py-3 bg-linear-to-r from-yellow-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-yellow-600 hover:to-pink-600 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center"
              >
                <i class="fas ${isEditing ? "fa-edit" : "fa-plus"} mr-2"></i>
                ${isEditing ? "Modifier la matière" : "Ajouter la matière"}
              </button>
            </div>
          </form>

          <!-- Liste des matières -->
          <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div class="px-6 py-5 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-800 flex items-center">
                <i class="fas fa-list-ul text-yellow-500 mr-3"></i>
                Liste des matières (${matieres.length})
              </h2>
            </div>

            ${
              matieres.length === 0
                ? `
                <div class="p-12 text-center text-gray-500">
                  <i class="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
                  <p class="text-lg">Aucune matière ajoutée pour le moment</p>
                  <p class="mt-2">Commencez par en ajouter une ci-dessus !</p>
                </div>
              `
                : `
                <div class="divide-y divide-gray-100">
                  ${matieres.map((m) => this._renderRow(m, editingId)).join("")}
                </div>
              `
            }
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this._attachEvents();
  }

  _renderRow(matiere, editingId) {
    const isEditing = matiere.id === editingId;
    return `
      <div class="px-6 py-4 hover:bg-gray-50 transition-colors ${
        isEditing ? "bg-yellow-50" : ""
      }" data-id="${matiere.id}">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-medium text-gray-900">${
              matiere.intitule
            }</h3>
            <p class="text-sm text-gray-600 mt-1">
              <span class="inline-block px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">
                ${matiere.categorie}
              </span>
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <button 
              class="btn-edit px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-medium flex items-center gap-2 ${
                isEditing ? "opacity-50 cursor-not-allowed" : ""
              }"
              ${isEditing ? "disabled" : ""}
            >
              <i class="fas fa-edit"></i> Modifier
            </button>
            
            <button 
              class="btn-delete px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-medium flex items-center gap-2 ${
                isEditing ? "opacity-50 cursor-not-allowed" : ""
              }"
              ${isEditing ? "disabled" : ""}
            >
              <i class="fas fa-trash-alt"></i> Supprimer
            </button>
          </div>
        </div>
      </div>
    `;
  }

  _attachEvents() {
    const form = this.container.querySelector("#matiere-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = form.querySelector("#matiere-id").value.trim();
      const data = {
        intitule: form.querySelector("#intitule").value.trim(),
        categorie: form.querySelector("#categorie").value.trim(),
      };

      const errorEl = document.getElementById("form-error");
      errorEl.classList.add("hidden");

      if (!data.intitule || !data.categorie) {
        errorEl.textContent = "Veuillez remplir tous les champs obligatoires";
        errorEl.classList.remove("hidden");
        errorEl.classList.add("error-shake");
        setTimeout(() => errorEl.classList.remove("error-shake"), 800);
        return;
      }

      if (id) {
        this.onUpdate?.(id, data);
      } else {
        this.onCreate?.(data);
      }
    });

    // Annuler
    const cancelBtn = this.container.querySelector("#cancel-edit");
    if (cancelBtn) {
      cancelBtn.onclick = () => this.onUpdate?.(null, null);
    }

    // Édition & Suppression
    this.container.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.closest("[data-id]").dataset.id;
        this.onEditRequest?.(id);
      };
    });

    this.container.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.closest("[data-id]").dataset.id;
        if (confirm("Voulez-vous vraiment supprimer cette matière ?")) {
          this.onDelete?.(id);
        }
      };
    });
  }

  fillForm(matiere) {
    const form = this.container.querySelector("#matiere-form");
    if (!form || !matiere) return;

    form.querySelector("#matiere-id").value = matiere.id || "";
    form.querySelector("#intitule").value = matiere.intitule || "";
    form.querySelector("#categorie").value = matiere.categorie || "";
  }

  clearForm() {
    const form = this.container.querySelector("#matiere-form");
    if (form) {
      form.reset();
      form.querySelector("#matiere-id").value = "";
    }
  }

  showError(message) {
    const errorEl = document.getElementById("form-error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove("hidden");
      errorEl.classList.add("error-shake");
      setTimeout(() => errorEl.classList.remove("error-shake"), 800);
    } else {
      alert(message);
    }
  }

  showSuccess(message) {
    const successEl = document.getElementById("form-success");
    if (successEl) {
      successEl.textContent = message;
      successEl.classList.remove("hidden");
      setTimeout(() => successEl.classList.add("hidden"), 4000);
    }
  }
}
