// src/views/AssistantIAView.js

export class AssistantIAView {
  constructor(containerElement) {
    this.container = containerElement;

    // Callbacks contrôleur
    this.onSendMessage = null;
    this.onClearHistory = null;
  }

  render(messages = []) {
    const html = `
    <div class="flex flex-col h-screen max-w-6xl p-4 mx-auto">
      <header class="flex flex-col items-center justify-between py-4 mb-4 border-b border-gray-700 sm:flex-row">
        <h1 class="text-2xl font-bold text-transparent sm:text-3xl bg-linear-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text">
          Assistant IA EduConnect
        </h1>
        
      </header>

      <main class="flex flex-col flex-1 overflow-hidden">
        <div id="chat-messages" class="flex-1 px-2 py-4 space-y-6 overflow-y-auto scrollbar-thin">
          ${
            Array.isArray(messages) && messages.length > 0
              ? messages.map((m) => this._renderMessage(m)).join("")
              : this._renderWelcomeMessage()
          }
        </div>

        <div class="pt-4 border-t border-gray-700">
          <div class="flex gap-3">
            <textarea
              id="user-input"
              rows="1"
              placeholder="Pose-moi une question sur tes cours..."
              class="flex-1 px-5 py-4 text-gray-100 placeholder-gray-400 border border-gray-600 placeholder:text-sm resize-none rounded-2xl bg-gray-800/70 focus:border-yellow-400 focus:outline-none"
            ></textarea>
            <button
              id="send-btn"
              class="px-6 py-4 font-semibold shadow-lg bg-linear-to-r from-yellow-500 to-pink-600 rounded-2xl"
            >
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </main>
    </div>
    `;

    this.container.innerHTML = html;
    this._attachEvents();
  }

  _renderWelcomeMessage() {
    return `
      <div class="flex flex-col items-center justify-center h-full text-center text-gray-400">
        <i class="mb-4 text-4xl text-yellow-500 fas fa-robot"></i>
        <h3 class="mb-2 text-xl font-semibold">Bonjour 👋</h3>
        <p>Pose-moi une question sur tes cours.</p>
      </div>
    `;
  }

  _renderMessage(msg) {
    return `
      <div class="space-y-4">

        <!-- Message utilisateur -->
        <div class="flex justify-end max-w-[90%] ml-auto">
          <div class="px-5 py-3 rounded-2xl text-sm bg-linear-to-r from-yellow-600 to-pink-600 text-white">
            ${msg.question}
          </div>
        </div>

        <!-- Réponse IA -->
        <div class="flex justify-start max-w-[90%]">
          <div class="px-5 py-3 rounded-2xl text-sm bg-gray-800/80 border border-gray-700 text-gray-100">
            ${msg.reponse.replace(/\n/g, "<br>")}
          </div>
        </div>

      </div>
    `;
  }

  _attachEvents() {
    const sendBtn = this.container.querySelector("#send-btn");
    const userInput = this.container.querySelector("#user-input");

    const send = () => {
      const text = userInput.value.trim();
      if (text && this.onSendMessage) {
        this.onSendMessage(text);
        userInput.value = "";
        userInput.style.height = "auto";
        // Focus après envoi
        userInput.focus();
      }
    };

    sendBtn.onclick = send;

    userInput.onkeydown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    };

    userInput.oninput = () => {
      userInput.style.height = "auto";
      userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
    };

    // Auto-focus sur l'input au chargement
    setTimeout(() => {
      userInput.focus();
    }, 500);
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg animate-fade-in ${
      type === "error"
        ? "bg-red-500"
        : type === "success"
        ? "bg-green-500"
        : "bg-blue-500"
    }`;
    notification.textContent = message;

    this.container.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // 🔄 Indicateur de chargement IA
  showLoading() {
    const chat = this.container.querySelector("#chat-messages");
    const div = document.createElement("div");
    div.id = "ai-loading";
    div.innerHTML = `
      <div class="flex justify-start max-w-[90%]">
        <div class="px-5 py-3 rounded-2xl text-sm bg-gray-800/80 border border-gray-700 text-yellow-400">
          <i class="fas fa-circle-notch fa-spin mr-2"></i> Réflexion...
        </div>
      </div>
    `;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  removeLoading() {
    this.container.querySelector("#ai-loading")?.remove();
  }
}
