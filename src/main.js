import { loadFooter, loadHeader, loadPage } from "./app.js";

async function init() {
  try {
    // Charger le header et le footer
    await loadHeader();
    await loadFooter();

    // Déterminer la page initiale à charger
    // Soit depuis l'URL, soit la page par défaut
    const path = window.location.pathname.substring(1); // Enlever le "/"
    const initialPage = path || "home";

    // Charger la page initiale
    await loadPage(initialPage);

    console.log("Application initialisée avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
    // Fallback : afficher un message d'erreur
    document.getElementById("app").innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h2>Erreur de chargement</h2>
                <p>Impossible de charger l'application.</p>
            </div>
        `;
  }
}

// Démarrer l'application
init();
