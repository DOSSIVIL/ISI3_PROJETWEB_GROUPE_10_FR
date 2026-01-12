import { MatiereController } from "../src/Controller/MatiereController";
import { AssistantIAController } from "./Controller/assistantAiController";
// ------------------------------------------------------
// Fonction utilitaire : charge du HTML et exécute les scripts
// ------------------------------------------------------
async function loadHTMLWithScripts(targetId, url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    // Créer un conteneur temporaire
    const temp = document.createElement("div");
    temp.innerHTML = html;

    // Extraire les scripts du HTML
    const scripts = temp.querySelectorAll("script");

    // Extraire les liens CSS du HTML
    const styles = temp.querySelectorAll("link[rel='stylesheet']");

    // Injecter le HTML SANS les scripts ni les liens CSS
    document.getElementById(targetId).innerHTML = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<link[^>]*rel=['"]stylesheet['"][^>]*>/gi, "");

    // Ré-exécuter chaque script
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");

      if (oldScript.src) {
        // Script externe
        newScript.src = oldScript.src;
      } else {
        // Script inline
        newScript.textContent = oldScript.textContent;
      }

      document.body.appendChild(newScript);
    });

    // Ajouter les feuilles de style
    styles.forEach((oldStyle) => {
      const newStyle = document.createElement("link");
      newStyle.rel = "stylesheet";
      newStyle.href = oldStyle.href;
      document.head.appendChild(newStyle);
    });
  } catch (error) {
    console.error(`Erreur lors du chargement de ${url}:`, error);
  }
}

// ------------------------------------------------------
// Fonction pour charger le header
// ------------------------------------------------------
export async function loadHeader() {
  await loadHTMLWithScripts("header", "/src/views/templates/header.html");

  // Important : initialiser la navigation après chargement du header
  initNavigation();
}

// ------------------------------------------------------
// Fonction pour charger le footer
// ------------------------------------------------------
export async function loadFooter() {
  await loadHTMLWithScripts("footer", "/src/views/templates/footer.html");
}

// ------------------------------------------------------
// Fonction pour charger une page (SPA)
// ------------------------------------------------------

export async function loadPage(pageName) {
  try {
    await loadHTMLWithScripts("app", `/src/views/templates/${pageName}.html`);
    await loadPageCSS(pageName);

    // 🔥 INITIALISATION DES CONTROLEURS ICI
    if (pageName === "matiere") {
      const container = document.getElementById("matiere-container");
      if (container) {
        const ctrl = new MatiereController(container);
        await ctrl.init();
      }
    }
    if (pageName === "assistantAi") {
      const container = document.getElementById("assistant-ai-container");
      if (container) {
        const ctrl = new AssistantIAController(container);
        await ctrl.init();
      }
    }
    console.log("Page chargée :", pageName);

    window.history.pushState({ page: pageName }, "", `/${pageName}`);
  } catch (error) {
    console.error(`Erreur lors du chargement de la page ${pageName}:`, error);
  }
}

// ------------------------------------------------------
// Fonction pour charger le CSS d'une page
// ------------------------------------------------------
async function loadPageCSS(pageName) {
  try {
    const cssPath = `/src/views/css/${pageName}.css`;

    // Vérifier si le CSS est déjà chargé
    const existingLink = document.querySelector(`link[href="${cssPath}"]`);
    if (existingLink) return;

    // Créer un nouvel élément link
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssPath;
    link.id = `${pageName}-css`;

    // Ajouter au head
    document.head.appendChild(link);
  } catch (error) {
    console.warn(
      `CSS pour ${pageName} non trouvé ou erreur de chargement:`,
      error
    );
  }
}

// ------------------------------------------------------
// Initialiser la navigation dynamique (SPA links)
// ------------------------------------------------------
function initNavigation() {
  document.querySelectorAll("[data-page]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = e.target.getAttribute("data-page");
      loadPage(page);
    });
  });
}

// ------------------------------------------------------
// Gérer le bouton "retour" du navigateur
// ------------------------------------------------------
window.addEventListener("popstate", (e) => {
  if (e.state && e.state.page) {
    loadPage(e.state.page);
  }
});
