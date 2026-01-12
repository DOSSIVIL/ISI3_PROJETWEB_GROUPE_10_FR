// ------------------------------------------------------
// Liste des pages qui ne doivent pas avoir le header global
// ------------------------------------------------------
const PAGES_WITHOUT_GLOBAL_HEADER = [
    'docs',
    'documentation',
    'admin',
    'login'
    // Ajoute d'autres pages si nécessaire
];

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
        document.getElementById(targetId).innerHTML =
            html.replace(/<script[\s\S]*?<\/script>/gi, "")
               .replace(/<link[^>]*rel=['"]stylesheet['"][^>]*>/gi, "");

        // Ré-exécuter chaque script
        scripts.forEach(oldScript => {
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
        styles.forEach(oldStyle => {
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
// Fonction pour vérifier si une page nécessite le header global
// ------------------------------------------------------
function needsGlobalHeader(pageName) {
    return !PAGES_WITHOUT_GLOBAL_HEADER.includes(pageName);
}

// ------------------------------------------------------
// Fonction pour charger le header (modifiée)
// ------------------------------------------------------
export async function loadHeader(pageName = null) {
    // Si pageName est fourni, vérifier si elle a besoin du header global
    if (pageName && !needsGlobalHeader(pageName)) {
        console.log(`Page ${pageName} : header global désactivé`);
        document.getElementById("header").innerHTML = "";
        document.body.classList.add('no-global-header');
        return;
    }
    
    // Sinon, charger le header global
    await loadHTMLWithScripts("header", "/src/views/templates/header.html");
    document.body.classList.remove('no-global-header');
    
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
// Fonction pour charger une page (SPA) - MODIFIÉE
// ------------------------------------------------------
export async function loadPage(pageName) {
    try {
        // 1. Charger le header (ou pas) en fonction de la page
        await loadHeader(pageName);
        
        // 2. Charger le footer (toujours)
        await loadFooter();
        
        // 3. Charger le HTML de la page
        await loadHTMLWithScripts("app", `/src/views/templates/${pageName}.html`);
        
        // 4. Charger le CSS spécifique à la page
        await loadPageCSS(pageName);
        
        // 5. Mettre à jour l'URL sans recharger la page
        window.history.pushState({ page: pageName }, "", `/${pageName}`);
        
        // 6. Ajouter une classe au body pour cibler la page actuelle
        document.body.setAttribute('data-page', pageName);
        
        console.log(`Page ${pageName} chargée avec succès`);
    } catch (error) {
        console.error(`Erreur lors du chargement de la page ${pageName}:`, error);
        // Fallback vers la page d'accueil en cas d'erreur
        if (pageName !== 'home') {
            await loadPage('home');
        }
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
        
        // Supprimer les CSS de pages précédentes
        document.querySelectorAll('link[id$="-css"]').forEach(link => {
            if (link.id !== `${pageName}-css`) {
                link.remove();
            }
        });
        
        // Créer un nouvel élément link
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = cssPath;
        link.id = `${pageName}-css`;
        
        // Ajouter au head
        document.head.appendChild(link);
        
    } catch (error) {
        console.warn(`CSS pour ${pageName} non trouvé ou erreur de chargement:`, error);
    }
}

// ------------------------------------------------------
// Initialiser la navigation dynamique (SPA links) - MODIFIÉE
// ------------------------------------------------------
function initNavigation() {
    document.querySelectorAll("[data-page]").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const page = e.target.getAttribute("data-page");
            loadPage(page);
        });
    });
    
    // Ajouter un gestionnaire pour les liens de retour à l'accueil
    document.querySelectorAll(".back-to-home, [href='/'], [href='/home']").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            loadPage("home");
        });
    });
}

// ------------------------------------------------------
// Gérer le bouton "retour" du navigateur - MODIFIÉE
// ------------------------------------------------------
window.addEventListener("popstate", e => {
    if (e.state && e.state.page) {
        loadPage(e.state.page);
    } else {
        // Retour à la page d'accueil par défaut
        loadPage("home");
    }
});