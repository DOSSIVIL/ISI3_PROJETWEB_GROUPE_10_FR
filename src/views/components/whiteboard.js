// scripts/whiteboard.js - CODE COMPLET CORRIGÉ
class WhiteboardManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentTool = 'pencil';
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.lastX = 0;
        this.lastY = 0;
        this.startX = 0;
        this.startY = 0;
        this.history = [];
        this.historyIndex = -1;
        this.gridEnabled = false;
        this.gridCanvas = null;
        this.gridCtx = null;
        this.textMode = false;
        this.textInput = null;
        this.tempCanvas = null;
        this.tempCtx = null;
        this.drawingPoints = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        console.log('Initialisation du tableau blanc...');
        
        // Attendre que le DOM soit complètement chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.canvas = document.getElementById('whiteboard-canvas');
        if (!this.canvas) {
            console.error('Canvas non trouvé, tentative de réessai...');
            setTimeout(() => this.setup(), 100);
            return;
        }
        
        // Vérifier que le canvas est visible
        if (this.canvas.offsetParent === null) {
            console.log('Canvas dans modal caché, initialisation différée');
            this.isInitialized = false;
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        this.setupCanvas();
        this.setupEventListeners();
        this.setupTools();
        this.createGridLayer();
        
        // Créer un canvas temporaire pour les prévisualisations
        this.createTempCanvas();
        
        // Sauvegarder l'état initial
        this.saveState();
        
        this.isInitialized = true;
        console.log('Tableau blanc initialisé avec succès');
    }

    createTempCanvas() {
        this.tempCanvas = document.createElement('canvas');
        this.tempCtx = this.tempCanvas.getContext('2d');
        
        // Synchroniser les dimensions
        this.tempCanvas.width = this.canvas.width;
        this.tempCanvas.height = this.canvas.height;
        
        // Configurer le contexte
        this.tempCtx.lineCap = 'round';
        this.tempCtx.lineJoin = 'round';
        this.tempCtx.lineWidth = this.brushSize;
        this.tempCtx.strokeStyle = this.currentColor;
    }

    createGridLayer() {
        // Créer un canvas séparé pour la grille
        this.gridCanvas = document.createElement('canvas');
        this.gridCtx = this.gridCanvas.getContext('2d');
        
        // Positionner par-dessus le canvas principal
        this.gridCanvas.style.position = 'absolute';
        this.gridCanvas.style.top = '0';
        this.gridCanvas.style.left = '0';
        this.gridCanvas.style.pointerEvents = 'none';
        this.gridCanvas.style.zIndex = '1';
        
        // Ajouter au conteneur
        const container = this.canvas.parentElement;
        if (container) {
            container.style.position = 'relative';
            container.appendChild(this.gridCanvas);
        }
        
        // Redimensionner avec le canvas principal
        this.gridCanvas.width = this.canvas.width;
        this.gridCanvas.height = this.canvas.height;
    }

    setupCanvas() {
        // Ajuster la taille du canvas
        this.resizeCanvas();
        
        // Configurer le contexte
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = this.brushSize;
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.fillStyle = this.currentColor;
        
        // Fond blanc
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.currentColor;
        
        // Écouter le redimensionnement
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas || !this.canvas.parentElement) return;
        
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight - 60; // Hauteur moins les outils
        
        // Définir les nouvelles dimensions
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;
        
        // Redimensionner le canvas temporaire
        if (this.tempCanvas) {
            this.tempCanvas.width = containerWidth;
            this.tempCanvas.height = containerHeight;
        }
        
        // Redimensionner la grille
        if (this.gridCanvas) {
            this.gridCanvas.width = containerWidth;
            this.gridCanvas.height = containerHeight;
            
            if (this.gridEnabled) {
                this.drawGrid();
            }
        }
        
        // Redessiner si on a un historique
        if (this.history.length > 0 && this.historyIndex >= 0) {
            this.restoreFromHistory();
        } else {
            // Sinon, redessiner un fond blanc
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = this.currentColor;
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.brushSize;
        }
        
        console.log(`Canvas redimensionné: ${containerWidth}x${containerHeight}`);
    }

    setupEventListeners() {
        if (!this.canvas) return;
        
        // Dessin à la souris
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Dessin tactile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = this.getTouchPos(e);
            this.startDrawing({ clientX: touch.x, clientY: touch.y });
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = this.getTouchPos(e);
            this.draw({ clientX: touch.x, clientY: touch.y });
        });
        
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
        
        // Double-clic pour le texte
        this.canvas.addEventListener('dblclick', (e) => {
            if (this.currentTool === 'text') {
                this.startTextInput(e);
            }
        });
        
        // Empêcher le menu contextuel sur le canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    getTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }

    getCanvasPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getCanvasPos(e);
        [this.lastX, this.lastY] = [pos.x, pos.y];
        [this.startX, this.startY] = [pos.x, pos.y];
        
        // Commencer l'enregistrement des points pour la collaboration
        this.startRecording();
        this.recordPoint(pos.x, pos.y);
        
        // Pour le crayon, commencer immédiatement
        if (this.currentTool === 'pencil') {
            this.drawPencil(pos.x, pos.y, true);
        }
        
        // Pour la gomme, commencer immédiatement
        if (this.currentTool === 'eraser') {
            this.drawEraser(pos.x, pos.y);
        }
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getCanvasPos(e);
        const x = pos.x;
        const y = pos.y;
        
        // Enregistrer le point pour la collaboration
        this.recordPoint(x, y);
        
        switch(this.currentTool) {
            case 'pencil':
                this.drawPencil(x, y);
                break;
            case 'eraser':
                this.drawEraser(x, y);
                break;
            case 'line':
                this.drawLine(x, y);
                break;
            case 'rectangle':
                this.drawRectangle(x, y);
                break;
            case 'circle':
                this.drawCircle(x, y);
                break;
            case 'text':
                // Le texte est géré par startTextInput
                break;
        }
        
        this.lastX = x;
        this.lastY = y;
    }

    drawPencil(x, y, startNewPath = false) {
        if (startNewPath) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
        } else {
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
    }

    drawEraser(x, y) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.brushSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawLine(x, y) {
        // Effacer le canvas temporairement pour prévisualiser
        this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        this.tempCtx.drawImage(this.canvas, 0, 0);
        
        // Dessiner la ligne temporaire
        this.tempCtx.beginPath();
        this.tempCtx.moveTo(this.startX, this.startY);
        this.tempCtx.lineTo(x, y);
        this.tempCtx.strokeStyle = this.currentColor;
        this.tempCtx.lineWidth = this.brushSize;
        this.tempCtx.stroke();
        
        // Afficher le résultat temporaire
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.tempCanvas, 0, 0);
    }

    drawRectangle(x, y) {
        const width = x - this.startX;
        const height = y - this.startY;
        
        // Effacer et redessiner
        this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        this.tempCtx.drawImage(this.canvas, 0, 0);
        
        // Dessiner le rectangle temporaire
        this.tempCtx.strokeRect(this.startX, this.startY, width, height);
        
        // Afficher
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.tempCanvas, 0, 0);
    }

    drawCircle(x, y) {
        const radius = Math.sqrt(
            Math.pow(x - this.startX, 2) + Math.pow(y - this.startY, 2)
        );
        
        // Effacer et redessiner
        this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        this.tempCtx.drawImage(this.canvas, 0, 0);
        
        // Dessiner le cercle temporaire
        this.tempCtx.beginPath();
        this.tempCtx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
        this.tempCtx.stroke();
        
        // Afficher
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.tempCanvas, 0, 0);
    }

    startTextInput(e) {
        const pos = this.getCanvasPos(e);
        const modal = document.getElementById('whiteboard-modal');
        
        // Créer un input pour la saisie de texte
        this.textInput = document.createElement('input');
        this.textInput.type = 'text';
        this.textInput.style.position = 'absolute';
        this.textInput.style.left = (e.clientX - modal.getBoundingClientRect().left + 10) + 'px';
        this.textInput.style.top = (e.clientY - modal.getBoundingClientRect().top + 10) + 'px';
        this.textInput.style.fontSize = '16px';
        this.textInput.style.padding = '8px 12px';
        this.textInput.style.border = `2px solid ${this.currentColor}`;
        this.textInput.style.borderRadius = '4px';
        this.textInput.style.outline = 'none';
        this.textInput.style.zIndex = '1000';
        this.textInput.style.backgroundColor = 'white';
        this.textInput.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        this.textInput.style.minWidth = '200px';
        
        modal.appendChild(this.textInput);
        this.textInput.focus();
        
        // Quand l'utilisateur appuie sur Entrée
        this.textInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.finishTextInput(pos.x, pos.y);
            } else if (event.key === 'Escape') {
                this.cancelTextInput();
            }
        });
        
        // Quand l'input perd le focus
        this.textInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (this.textInput) {
                    this.finishTextInput(pos.x, pos.y);
                }
            }, 100);
        });
    }

    finishTextInput(x, y) {
        if (!this.textInput) return;
        
        const text = this.textInput.value.trim();
        if (text) {
            // Dessiner le texte sur le canvas
            this.ctx.font = `${this.brushSize * 3}px Arial`;
            this.ctx.fillStyle = this.currentColor;
            this.ctx.fillText(text, x, y);
            this.saveState();
            
            // Envoyer aux autres participants
            this.sendDrawingData({
                action: 'text',
                text: text,
                x: x,
                y: y,
                color: this.currentColor,
                fontSize: this.brushSize * 3
            });
        }
        
        this.cancelTextInput();
    }

    cancelTextInput() {
        if (this.textInput && this.textInput.parentElement) {
            this.textInput.parentElement.removeChild(this.textInput);
            this.textInput = null;
        }
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            
            // Sauvegarder l'état final pour les formes
            if (['rectangle', 'circle', 'line'].includes(this.currentTool)) {
                // Dessiner la forme finale
                this.ctx.beginPath();
                
                switch(this.currentTool) {
                    case 'line':
                        this.ctx.moveTo(this.startX, this.startY);
                        this.ctx.lineTo(this.lastX, this.lastY);
                        this.ctx.stroke();
                        break;
                    case 'rectangle':
                        const width = this.lastX - this.startX;
                        const height = this.lastY - this.startY;
                        this.ctx.strokeRect(this.startX, this.startY, width, height);
                        break;
                    case 'circle':
                        const radius = Math.sqrt(
                            Math.pow(this.lastX - this.startX, 2) + 
                            Math.pow(this.lastY - this.startY, 2)
                        );
                        this.ctx.beginPath();
                        this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
                        this.ctx.stroke();
                        break;
                }
                
                this.saveState();
                
                // Envoyer aux autres participants
                this.sendDrawingData({
                    action: this.currentTool,
                    startX: this.startX,
                    startY: this.startY,
                    endX: this.lastX,
                    endY: this.lastY,
                    color: this.currentColor,
                    brushSize: this.brushSize
                });
            } else if (this.currentTool === 'pencil' || this.currentTool === 'eraser') {
                this.saveState();
                
                // Envoyer les points de dessin aux autres participants
                if (this.drawingPoints && this.drawingPoints.length > 1) {
                    this.sendDrawingData({
                        action: 'draw',
                        points: this.drawingPoints,
                        color: this.currentColor,
                        brushSize: this.brushSize,
                        tool: this.currentTool
                    });
                }
            }
            
            // Arrêter l'enregistrement
            this.stopRecording();
        }
    }

    setupTools() {
        // Outils
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTool(e.currentTarget.dataset.tool);
            });
        });
        
        // Couleurs
        const colorPicker = document.getElementById('color-picker');
        if (colorPicker) {
            colorPicker.value = this.currentColor;
            colorPicker.addEventListener('change', (e) => {
                this.setColor(e.target.value);
            });
        }
        
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.currentTarget.dataset.color;
                this.setColor(color);
                if (colorPicker) {
                    colorPicker.value = color;
                }
            });
        });
        
        // Taille du pinceau
        const brushSize = document.getElementById('brush-size');
        const brushSizeValue = document.getElementById('brush-size-value');
        
        if (brushSize && brushSizeValue) {
            brushSize.value = this.brushSize;
            brushSizeValue.textContent = this.brushSize + 'px';
            
            brushSize.addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
                brushSizeValue.textContent = this.brushSize + 'px';
                this.ctx.lineWidth = this.brushSize;
                this.tempCtx.lineWidth = this.brushSize;
                
                // Envoyer le changement aux autres participants
                this.sendDrawingData({
                    action: 'brushSize',
                    brushSize: this.brushSize
                });
            });
        }
        
        // Raccourcis clavier pour le tableau blanc
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'z':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.redo();
                        } else {
                            e.preventDefault();
                            this.undo();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.setTool('eraser');
                        break;
                    case 'p':
                        e.preventDefault();
                        this.setTool('pencil');
                        break;
                    case 'l':
                        e.preventDefault();
                        this.setTool('line');
                        break;
                    case 'r':
                        e.preventDefault();
                        this.setTool('rectangle');
                        break;
                    case 'c':
                        e.preventDefault();
                        this.setTool('circle');
                        break;
                    case 't':
                        e.preventDefault();
                        this.setTool('text');
                        break;
                    case 'g':
                        e.preventDefault();
                        this.toggleGrid();
                        break;
                }
            }
        });
    }

    setTool(tool) {
        this.currentTool = tool;
        
        // Mettre à jour l'interface
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tool === tool) {
                btn.classList.add('active');
            }
        });
        
        // Si on passe à un autre outil, annuler la saisie de texte
        if (tool !== 'text' && this.textInput) {
            this.cancelTextInput();
        }
        
        // Envoyer le changement aux autres participants
        this.sendDrawingData({
            action: 'tool',
            tool: tool
        });
        
        console.log(`Outil changé: ${tool}`);
    }

    setColor(color) {
        this.currentColor = color;
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.tempCtx.strokeStyle = color;
        
        // Mettre à jour l'interface
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === color) {
                option.classList.add('selected');
            }
        });
        
        // Envoyer le changement aux autres participants
        this.sendDrawingData({
            action: 'color',
            color: color
        });
        
        console.log(`Couleur changée: ${color}`);
    }

    saveState() {
        try {
            // Limiter l'historique à 50 états
            if (this.history.length >= 50) {
                this.history.shift();
                if (this.historyIndex > 0) this.historyIndex--;
            }
            
            const state = this.canvas.toDataURL();
            this.history.push(state);
            this.historyIndex = this.history.length - 1;
            
            console.log(`État sauvegardé (total: ${this.history.length})`);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde d\'état:', error);
        }
    }

    restoreFromHistory() {
        if (this.history.length > 0 && this.historyIndex >= 0) {
            try {
                const state = this.history[this.historyIndex];
                const img = new Image();
                
                img.onload = () => {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.drawImage(img, 0, 0);
                    
                    // Redessiner la grille si nécessaire
                    if (this.gridEnabled) {
                        this.drawGrid();
                    }
                };
                
                img.onerror = () => {
                    console.error('Erreur de chargement de l\'image historique');
                };
                
                img.src = state;
            } catch (error) {
                console.error('Erreur lors de la restauration:', error);
            }
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreFromHistory();
            console.log(`Annulé (index: ${this.historyIndex})`);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreFromHistory();
            console.log(`Rétabli (index: ${this.historyIndex})`);
        }
    }

    clear() {
        // Demander confirmation
        if (!confirm('Voulez-vous vraiment effacer tout le tableau ?')) {
            return;
        }
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.currentColor;
        this.ctx.strokeStyle = this.currentColor;
        
        // Réinitialiser l'historique
        this.saveState();
        
        // Envoyer l'action de suppression aux autres participants
        this.sendDrawingData({
            action: 'clear',
            timestamp: Date.now()
        });
        
        // Redessiner la grille si nécessaire
        if (this.gridEnabled) {
            this.drawGrid();
        }
        
        console.log('Tableau effacé');
        
        if (window.showNotification) {
            window.showNotification('Tableau blanc', 'Le tableau a été effacé', 'info');
        }
    }

    save() {
        try {
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            const time = new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }).replace(/:/g, '-');
            
            link.download = `tableau-blanc-${date}_${time}.png`;
            link.href = this.canvas.toDataURL('image/png');
            link.click();
            
            console.log('Tableau sauvegardé');
            
            if (window.showNotification) {
                window.showNotification('Tableau sauvegardé', 'Le tableau a été téléchargé', 'success');
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            
            if (window.showNotification) {
                window.showNotification('Erreur', 'Impossible de sauvegarder le tableau', 'error');
            }
        }
    }

    toggleGrid() {
        this.gridEnabled = !this.gridEnabled;
        
        if (this.gridEnabled) {
            this.drawGrid();
        } else {
            this.clearGrid();
        }
        
        // Mettre à jour le bouton
        const gridBtn = document.querySelector('[onclick="toggleGrid()"]');
        if (gridBtn) {
            const icon = gridBtn.querySelector('i');
            if (icon) {
                icon.className = this.gridEnabled ? 'fas fa-th-large' : 'fas fa-th';
            }
            gridBtn.classList.toggle('active', this.gridEnabled);
        }
        
        console.log(`Grille ${this.gridEnabled ? 'activée' : 'désactivée'}`);
    }

    drawGrid() {
        if (!this.gridCanvas || !this.gridCtx) return;
        
        const gridSize = 20;
        const width = this.gridCanvas.width;
        const height = this.gridCanvas.height;
        
        // Effacer la grille existante
        this.gridCtx.clearRect(0, 0, width, height);
        
        // Configurer le style
        this.gridCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.gridCtx.lineWidth = 1;
        this.gridCtx.setLineDash([2, 2]);
        
        // Lignes verticales
        for (let x = 0; x <= width; x += gridSize) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(x, 0);
            this.gridCtx.lineTo(x, height);
            this.gridCtx.stroke();
        }
        
        // Lignes horizontales
        for (let y = 0; y <= height; y += gridSize) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(0, y);
            this.gridCtx.lineTo(width, y);
            this.gridCtx.stroke();
        }
        
        // Réinitialiser le line dash
        this.gridCtx.setLineDash([]);
    }

    clearGrid() {
        if (this.gridCanvas && this.gridCtx) {
            this.gridCtx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
        }
    }

    // Collaboration via Peer.js
    sendDrawingData(data) {
        if (window.tutoringRoomManager?.peerManager) {
            try {
                window.tutoringRoomManager.peerManager.sendData({
                    type: 'whiteboard',
                    data: {
                        ...data,
                        userId: window.tutoringRoomManager.peerManager.userId,
                        timestamp: Date.now()
                    }
                });
            } catch (error) {
                console.error('Erreur lors de l\'envoi des données de dessin:', error);
            }
        }
    }

    handleIncomingDrawing(data) {
        try {
            if (!data || typeof data !== 'object') {
                throw new Error('Données de dessin invalides');
            }
            
            console.log('Données de dessin reçues:', data.action);
            
            switch(data.action) {
                case 'draw':
                    this.drawRemote(data);
                    break;
                case 'clear':
                    this.clear();
                    break;
                case 'tool':
                    this.setTool(data.tool);
                    break;
                case 'color':
                    this.setColor(data.color);
                    break;
                case 'brushSize':
                    this.brushSize = data.brushSize;
                    this.ctx.lineWidth = this.brushSize;
                    this.tempCtx.lineWidth = this.brushSize;
                    break;
                case 'line':
                case 'rectangle':
                case 'circle':
                    this.drawRemoteShape(data);
                    break;
                case 'text':
                    this.drawRemoteText(data);
                    break;
                default:
                    console.warn('Action de dessin non reconnue:', data.action);
            }
        } catch (error) {
            console.error('Erreur lors du traitement des données de dessin:', error);
        }
    }

    drawRemote(data) {
        if (!data.points || !Array.isArray(data.points) || data.points.length < 2) return;
        
        // Sauvegarder l'état actuel du contexte
        const originalStrokeStyle = this.ctx.strokeStyle;
        const originalLineWidth = this.ctx.lineWidth;
        const originalGlobalCompositeOperation = this.ctx.globalCompositeOperation;
        
        // Appliquer les paramètres du dessin distant
        this.ctx.strokeStyle = data.color || '#000000';
        this.ctx.lineWidth = data.brushSize || 5;
        
        if (data.tool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        }
        
        // Dessiner les points
        this.ctx.beginPath();
        this.ctx.moveTo(data.points[0].x, data.points[0].y);
        
        for (let i = 1; i < data.points.length; i++) {
            this.ctx.lineTo(data.points[i].x, data.points[i].y);
        }
        
        this.ctx.stroke();
        
        // Restaurer l'état du contexte
        this.ctx.strokeStyle = originalStrokeStyle;
        this.ctx.lineWidth = originalLineWidth;
        this.ctx.globalCompositeOperation = originalGlobalCompositeOperation;
        
        // Sauvegarder l'état
        this.saveState();
    }

    drawRemoteShape(data) {
        // Sauvegarder l'état actuel du contexte
        const originalStrokeStyle = this.ctx.strokeStyle;
        const originalLineWidth = this.ctx.lineWidth;
        
        // Appliquer les paramètres du dessin distant
        this.ctx.strokeStyle = data.color || '#000000';
        this.ctx.lineWidth = data.brushSize || 5;
        
        // Dessiner la forme
        this.ctx.beginPath();
        
        switch(data.action) {
            case 'line':
                this.ctx.moveTo(data.startX, data.startY);
                this.ctx.lineTo(data.endX, data.endY);
                break;
            case 'rectangle':
                const width = data.endX - data.startX;
                const height = data.endY - data.startY;
                this.ctx.strokeRect(data.startX, data.startY, width, height);
                break;
            case 'circle':
                const radius = Math.sqrt(
                    Math.pow(data.endX - data.startX, 2) + 
                    Math.pow(data.endY - data.startY, 2)
                );
                this.ctx.arc(data.startX, data.startY, radius, 0, Math.PI * 2);
                break;
        }
        
        this.ctx.stroke();
        
        // Restaurer l'état du contexte
        this.ctx.strokeStyle = originalStrokeStyle;
        this.ctx.lineWidth = originalLineWidth;
        
        // Sauvegarder l'état
        this.saveState();
    }

    drawRemoteText(data) {
        // Sauvegarder l'état actuel du contexte
        const originalFillStyle = this.ctx.fillStyle;
        const originalFont = this.ctx.font;
        
        // Appliquer les paramètres du texte distant
        this.ctx.fillStyle = data.color || '#000000';
        this.ctx.font = `${data.fontSize || 16}px Arial`;
        
        // Dessiner le texte
        this.ctx.fillText(data.text, data.x, data.y);
        
        // Restaurer l'état du contexte
        this.ctx.fillStyle = originalFillStyle;
        this.ctx.font = originalFont;
        
        // Sauvegarder l'état
        this.saveState();
    }

    // Méthodes pour enregistrer les données de dessin
    startRecording() {
        this.drawingPoints = [];
    }

    recordPoint(x, y) {
        if (this.drawingPoints) {
            this.drawingPoints.push({ 
                x, 
                y, 
                timestamp: Date.now() 
            });
            
            // Limiter le nombre de points pour éviter la surcharge
            if (this.drawingPoints.length > 100) {
                this.drawingPoints.shift();
            }
        }
    }

    stopRecording() {
        this.drawingPoints = null;
    }

    // Méthode pour exporter/charger
    exportData() {
        return {
            history: this.history,
            currentState: this.canvas.toDataURL(),
            settings: {
                currentColor: this.currentColor,
                brushSize: this.brushSize,
                currentTool: this.currentTool,
                gridEnabled: this.gridEnabled
            },
            timestamp: Date.now()
        };
    }

    importData(data) {
        try {
            if (data.history && Array.isArray(data.history)) {
                this.history = data.history;
                this.historyIndex = this.history.length - 1;
                this.restoreFromHistory();
            }
            
            if (data.settings) {
                this.setColor(data.settings.currentColor);
                this.brushSize = data.settings.brushSize;
                this.ctx.lineWidth = this.brushSize;
                this.tempCtx.lineWidth = this.brushSize;
                this.setTool(data.settings.currentTool);
                
                if (data.settings.gridEnabled) {
                    this.toggleGrid();
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'importation des données:', error);
        }
    }

    // Méthode de nettoyage
    destroy() {
        // Supprimer les écouteurs d'événements
        window.removeEventListener('resize', () => this.resizeCanvas());
        
        if (this.canvas) {
            const newCanvas = this.canvas.cloneNode(false);
            this.canvas.parentNode.replaceChild(newCanvas, this.canvas);
            this.canvas = null;
            this.ctx = null;
        }
        
        // Nettoyer le canvas de grille
        if (this.gridCanvas && this.gridCanvas.parentElement) {
            this.gridCanvas.parentElement.removeChild(this.gridCanvas);
            this.gridCanvas = null;
            this.gridCtx = null;
        }
        
        // Nettoyer l'input texte
        this.cancelTextInput();
        
        // Nettoyer le canvas temporaire
        this.tempCanvas = null;
        this.tempCtx = null;
        
        // Réinitialiser les variables
        this.isInitialized = false;
        this.history = [];
        this.historyIndex = -1;
        
        console.log('Tableau blanc nettoyé');
    }
}

// Fonctions globales pour les boutons HTML
function clearWhiteboard() {
    if (window.whiteboardManager) {
        window.whiteboardManager.clear();
    }
}

function saveWhiteboard() {
    if (window.whiteboardManager) {
        window.whiteboardManager.save();
    }
}

function toggleGrid() {
    if (window.whiteboardManager) {
        window.whiteboardManager.toggleGrid();
    }
}

function openWhiteboard() {
    const modal = document.getElementById('whiteboard-modal');
    if (modal) {
        modal.classList.remove('hidden');
        
        // Initialiser le tableau blanc si pas déjà fait
        if (!window.whiteboardManager) {
            window.whiteboardManager = new WhiteboardManager();
        } else if (!window.whiteboardManager.isInitialized) {
            // Réinitialiser si besoin
            window.whiteboardManager.setup();
        }
        
        // Forcer le redimensionnement après l'ouverture du modal
        setTimeout(() => {
            if (window.whiteboardManager && window.whiteboardManager.resizeCanvas) {
                window.whiteboardManager.resizeCanvas();
            }
        }, 100);
    }
}

function closeWhiteboard() {
    const modal = document.getElementById('whiteboard-modal');
    if (modal) {
        modal.classList.add('hidden');
        
        // Nettoyer l'input texte s'il existe
        if (window.whiteboardManager && window.whiteboardManager.textInput) {
            window.whiteboardManager.cancelTextInput();
        }
    }
}

function undoWhiteboard() {
    if (window.whiteboardManager) {
        window.whiteboardManager.undo();
    }
}

function redoWhiteboard() {
    if (window.whiteboardManager) {
        window.whiteboardManager.redo();
    }
}

// Initialiser quand la modal s'ouvre
document.addEventListener('DOMContentLoaded', function() {
    const openBtn = document.getElementById('open-whiteboard');
    if (openBtn) {
        openBtn.addEventListener('click', openWhiteboard);
    }
    
    const closeBtn = document.querySelector('#whiteboard-modal .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeWhiteboard);
    }
    
    // Fermer la modal avec ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeWhiteboard();
        }
    });
    
    // Détecter la fermeture du modal
    const modal = document.getElementById('whiteboard-modal');
    if (modal) {
        // Observer les changements de style pour détecter la fermeture
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (modal.classList.contains('hidden')) {
                        // Nettoyer le tableau blanc quand le modal est fermé
                        if (window.whiteboardManager) {
                            window.whiteboardManager.cancelTextInput();
                        }
                    }
                }
            });
        });
        
        observer.observe(modal, { attributes: true });
    }
});

// Exporter pour utilisation globale
window.WhiteboardManager = WhiteboardManager;
window.whiteboardManager = null;