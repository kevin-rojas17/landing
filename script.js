// Estado de la aplicación
const appState = {
    comments: [],
    isVoiceEnabled: true,
    isBotReading: false,
    viewerCount: 0,
    startTime: Date.now()
};

// Respuestas predefinidas del bot
const botResponses = [
    "¡Excelente comentario!",
    "Gracias por participar",
    "Muy interesante tu opinión",
    "¡Me encanta esa perspectiva!",
    "Buen punto",
    "¡Totalmente de acuerdo!",
    "Gracias por estar aquí",
    "¡Qué buen comentario!",
    "Interesante reflexión",
    "¡Sigue participando!"
];

// Referencias al DOM
const videoPlayer = document.getElementById('videoPlayer');
const commentForm = document.getElementById('commentForm');
const usernameInput = document.getElementById('usernameInput');
const commentInput = document.getElementById('commentInput');
const commentsArea = document.getElementById('commentsArea');
const toggleVoiceBtn = document.getElementById('toggleVoice');
const botStatus = document.getElementById('botStatus');
const liveTimeDisplay = document.getElementById('liveTime');
const viewerCountDisplay = document.getElementById('viewerCount');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Configurar video en loop para simular transmisión continua
    videoPlayer.loop = true;
    
    // Actualizar tiempo en vivo
    updateLiveTime();
    setInterval(updateLiveTime, 1000);
    
    // Simular espectadores
    updateViewerCount();
    setInterval(updateViewerCount, 5000);
    
    // Event listeners
    commentForm.addEventListener('submit', handleCommentSubmit);
    toggleVoiceBtn.addEventListener('click', toggleVoice);
    
    // Verificar soporte de síntesis de voz
    if (!('speechSynthesis' in window)) {
        appState.isVoiceEnabled = false;
        toggleVoiceBtn.textContent = '🔇 Voz No Disponible';
        toggleVoiceBtn.disabled = true;
        toggleVoiceBtn.classList.add('disabled');
    }
}

// Manejo de envío de comentarios
function handleCommentSubmit(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const commentText = commentInput.value.trim();
    
    if (username && commentText) {
        addComment(username, commentText, false);
        commentInput.value = '';
        
        // El bot responde después de un pequeño delay
        setTimeout(() => {
            processBotResponse(username, commentText);
        }, 2000);
    }
}

// Agregar comentario al chat
function addComment(username, text, isBot = false) {
    const comment = {
        id: Date.now(),
        username,
        text,
        timestamp: new Date(),
        isBot
    };
    
    appState.comments.push(comment);
    renderComment(comment);
    
    // Leer comentario si está habilitada la voz
    if (!isBot && appState.isVoiceEnabled) {
        readComment(username, text);
    }
}

// Renderizar comentario en el DOM
function renderComment(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = comment.isBot ? 'comment bot-comment' : 'comment';
    commentDiv.innerHTML = `
        <div class="comment-header">
            <span class="comment-user">${comment.isBot ? '🤖 Bot' : comment.username}</span>
            <span class="comment-time">${formatTime(comment.timestamp)}</span>
        </div>
        <div class="comment-text">${escapeHtml(comment.text)}</div>
    `;
    
    commentsArea.appendChild(commentDiv);
    commentsArea.scrollTop = commentsArea.scrollHeight;
}

// Bot procesa y responde al comentario
function processBotResponse(username, commentText) {
    const response = botResponses[Math.floor(Math.random() * botResponses.length)];
    const fullResponse = `@${username}: ${response}`;
    
    addComment('Bot', fullResponse, true);
}

// Leer comentario con síntesis de voz
function readComment(username, text) {
    if (!appState.isVoiceEnabled || appState.isBotReading) return;
    
    appState.isBotReading = true;
    botStatus.textContent = `Leyendo: ${username}`;
    
    const utterance = new SpeechSynthesisUtterance(`${username} dice: ${text}`);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
        appState.isBotReading = false;
        botStatus.textContent = 'Esperando comentarios...';
    };
    
    utterance.onerror = () => {
        appState.isBotReading = false;
        botStatus.textContent = 'Error al leer comentario';
    };
    
    window.speechSynthesis.speak(utterance);
}

// Toggle de voz
function toggleVoice() {
    appState.isVoiceEnabled = !appState.isVoiceEnabled;
    toggleVoiceBtn.textContent = appState.isVoiceEnabled ? '🔊 Voz Activada' : '🔇 Voz Desactivada';
    
    if (!appState.isVoiceEnabled) {
        window.speechSynthesis.cancel();
        botStatus.textContent = 'Voz desactivada';
    } else {
        botStatus.textContent = 'Esperando comentarios...';
    }
}

// Actualizar tiempo en vivo
function updateLiveTime() {
    const elapsed = Date.now() - appState.startTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    liveTimeDisplay.textContent = 
        `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Actualizar contador de espectadores
function updateViewerCount() {
    const variation = Math.floor(Math.random() * 10) - 5;
    appState.viewerCount = Math.max(0, appState.viewerCount + variation);
    
    if (appState.viewerCount === 0) {
        appState.viewerCount = Math.floor(Math.random() * 50) + 20;
    }
    
    viewerCountDisplay.textContent = `${appState.viewerCount} espectadores`;
}

// Utilidades
function formatTime(date) {
    return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
