/*************************************************
 * EduConnect Africa - Assistant IA
 * Auteur : Domisseck (ISI3 - Groupe 10)
 * Rôle : Gestion complète de l'interface IA
 *************************************************/

/* ============================
   CONFIGURATION API IA
============================ */
const DEEPSEEK_API_KEY = "REMPLACE_PAR_TA_CLE_API";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

/* ============================
   DONNÉES DES CATÉGORIES
============================ */
const categories = {
    math: {
        name: "Mathématiques",
        icon: "fa-calculator",
        prompt: "Tu es un tuteur expert en mathématiques pour les étudiants africains."
    },
    physics: {
        name: "Physique",
        icon: "fa-atom",
        prompt: "Tu es un tuteur expert en physique avec des exemples concrets africains."
    },
    earth: {
        name: "Sciences de la Terre",
        icon: "fa-globe-africa",
        prompt: "Tu es un expert en sciences de la Terre spécialisé sur l'Afrique."
    },
    literature: {
        name: "Littérature camerounaise",
        icon: "fa-book",
        prompt: "Tu es un expert en littérature camerounaise."
    },
    computer: {
        name: "Informatique",
        icon: "fa-laptop-code",
        prompt: "Tu es un tuteur en informatique orienté vers le marché africain."
    }
};

/* ============================
   VARIABLES GLOBALES
============================ */
let currentCategory = null;
let chatHistory = [];
let isProcessing = false;

let dailyStats = {
    messages: 0,
    startTime: new Date()
};

/* ============================
   INITIALISATION
============================ */
document.addEventListener("DOMContentLoaded", () => {
    initCategories();
    initChatControls();
    initUIControls();
    updateStats();
});

/* ============================
   GESTION DES CATÉGORIES
============================ */
function initCategories() {
    document.querySelectorAll(".category-card").forEach(btn => {
        btn.addEventListener("click", () => {
            selectCategory(btn.dataset.category);
        });
    });
}

function selectCategory(category) {
    if (currentCategory === category) return;

    document.querySelectorAll(".category-card").forEach(c =>
        c.classList.remove("active")
    );

    document.querySelector(`[data-category="${category}"]`)
        ?.classList.add("active");

    currentCategory = category;
    chatHistory = [];

    document.getElementById("messageInput").disabled = false;
    document.getElementById("sendBtn").disabled = false;

    showWelcomeMessage();
}

/* ============================
   MESSAGES CHAT
============================ */
function initChatControls() {
    document.getElementById("sendBtn").addEventListener("click", sendMessage);

    document.getElementById("messageInput").addEventListener("keypress", e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

async function sendMessage() {
    const input = document.getElementById("messageInput");
    const message = input.value.trim();

    if (!message || !currentCategory || isProcessing) return;

    addMessage(message, "user");
    input.value = "";

    dailyStats.messages++;
    updateStats();

    isProcessing = true;
    showTypingIndicator();

    try {
        const response = await callIA(message);
        removeTypingIndicator();
        addMessage(response, "assistant");
        saveHistory(message, response);
    } catch (e) {
        removeTypingIndicator();
        addMessage("❌ Erreur de connexion à l'IA.", "assistant");
        console.error(e);
    }

    isProcessing = false;
}

/* ============================
   API IA
============================ */
async function callIA(message) {
    const messages = [
        {
            role: "system",
            content: categories[currentCategory].prompt
        },
        ...chatHistory.slice(-6),
        { role: "user", content: message }
    ];

    const res = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages,
            temperature: 0.7,
            max_tokens: 1000
        })
    });

    const data = await res.json();
    return data.choices[0].message.content;
}

/* ============================
   AFFICHAGE DES MESSAGES
============================ */
function addMessage(text, sender) {
    const container = document.getElementById("chatMessages");

    const div = document.createElement("div");
    div.className = "fade-in mb-4";

    div.innerHTML = `
        <div class="${sender === "user" ? "message-bubble-user" : "message-bubble-ai"} p-4 rounded-xl max-w-2xl">
            <strong>${sender === "user" ? "Vous" : "Assistant IA"}</strong>
            <p class="mt-2 whitespace-pre-wrap">${escapeHtml(text)}</p>
        </div>
    `;

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    chatHistory.push({
        role: sender === "user" ? "user" : "assistant",
        content: text
    });
}

function showWelcomeMessage() {
    const container = document.getElementById("chatMessages");
    container.innerHTML = `
        <div class="message-bubble-ai p-6 rounded-xl">
            👋 Bonjour ! Je suis votre assistant IA en ${categories[currentCategory].name}.
        </div>
    `;
}

/* ============================
   INDICATEUR DE FRAPPE
============================ */
function showTypingIndicator() {
    const container = document.getElementById("chatMessages");
    const div = document.createElement("div");
    div.id = "typing";
    div.innerHTML = "⏳ L'IA réfléchit...";
    container.appendChild(div);
}

function removeTypingIndicator() {
    document.getElementById("typing")?.remove();
}

/* ============================
   HISTORIQUE LOCAL
============================ */
function saveHistory(user, ai) {
    const history = JSON.parse(localStorage.getItem("ai_history") || "[]");
    history.push({ user, ai, category: currentCategory, date: new Date() });
    localStorage.setItem("ai_history", JSON.stringify(history));
}

/* ============================
   STATISTIQUES
============================ */
function updateStats() {
    document.getElementById("dailyMessages").textContent = dailyStats.messages;

    const minutes = Math.floor(
        (new Date() - dailyStats.startTime) / 60000
    );
    document.getElementById("dailyTime").textContent = minutes;
}

/* ============================
   UI (SIDEBAR / DROPDOWN)
============================ */
function initUIControls() {
    document.getElementById("sidebarToggle")?.addEventListener("click", toggleSidebar);
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("hidden");
    document.getElementById("overlay").classList.toggle("hidden");
}

/* ============================
   UTILITAIRE
============================ */
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
