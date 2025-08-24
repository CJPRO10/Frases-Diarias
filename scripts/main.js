// Variables globales
let currentUser = null;
let currentNickname = '';
let currentDate = new Date();
let selectedDate = new Date();
let favorites = {};
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let isDarkMode = false;
let quotesCache = {};
let personalQuotes = [];
let allUsers = {};
let notificationTimer = null;

// Base de frases de respaldo personalizadas (más largas)
const fallbackQuotes = [
    "En cada amanecer encuentro una nueva razón para amarte más, porque tu amor es el regalo más hermoso que la vida me ha dado",
    "Tu sonrisa tiene el poder de transformar mis días grises en arcoíris llenos de esperanza y alegría infinita",
    "Eres la melodía más dulce que mi corazón ha aprendido a tocar, y cada latido es una nota de amor dedicada solo para ti",
    "En un mundo lleno de incertidumbres, tu amor es mi certeza más absoluta, mi refugio más seguro y mi hogar más cálido",
    "Tu fuerza interior es como un faro que ilumina no solo tu camino, sino también el mío, guiándome hacia un amor más profundo",
    "Cada día que pasa me doy cuenta de que contigo he encontrado no solo el amor, sino también mi mejor versión",
    "Tu belleza trasciende lo físico y se convierte en luz pura que ilumina cada rincón de mi alma",
    "Eres la respuesta a preguntas que ni siquiera sabía que mi corazón estaba haciendo",
    "Tu amor me ha enseñado que los cuentos de hadas sí existen, y el nuestro apenas está comenzando",
    "En tus ojos veo reflejado un futuro lleno de aventuras, risas y momentos inolvidables juntos",
    "Eres la prueba viviente de que los milagros existen, porque encontrarte fue el milagro más grande de mi vida",
    "Tu corazón generoso y tu alma bondadosa hacen de este mundo un lugar más hermoso y lleno de amor",
    "Cada conversación contigo es un tesoro, cada risa compartida es un diamante que guardo en mi memoria",
    "Tu presencia transforma lo ordinario en extraordinario, lo simple en mágico, lo común en especial",
    "Eres mi compañera de vida, mi cómplice de aventuras y mi refugio en los momentos difíciles"
];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando aplicación...');
    
    createFlowerBackground();
    loadAllUsers();
    checkCurrentSession();
    updateCalendar();
    checkNotificationSupport();
});

// Crear fondo de flores
function createFlowerBackground() {
    const flowersContainer = document.getElementById('flowersBackground');
    const flowerCount = Math.floor(window.innerWidth * window.innerHeight / 15000);
    
    for (let i = 0; i < flowerCount; i++) {
        const flower = document.createElement('div');
        flower.classList.add('flower');
        
        // Posición aleatoria
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        
        // Tamaño aleatorio
        const size = 20 + Math.random() * 40;
        
        // Retraso de animación aleatorio
        const delay = Math.random() * 5;
        
        flower.style.left = `${left}%`;
        flower.style.top = `${top}%`;
        flower.style.width = `${size}px`;
        flower.style.height = `${size}px`;
        flower.style.animationDelay = `-${delay}s`;
        
        flowersContainer.appendChild(flower);
    }
}

// Formatear fecha
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Mostrar mensaje bonito
function showMessage(text, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    
    // Configurar el mensaje
    messageText.textContent = text;
    messageBox.className = `message-box ${type}`;
    
    // Mostrar el mensaje
    messageBox.classList.remove('hidden');
    
    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
        hideMessage();
    }, 5000);
}

// Ocultar mensaje
function hideMessage() {
    const messageBox = document.getElementById('messageBox');
    messageBox.classList.add('hidden');
}

// Alternar tema claro/oscuro
function toggleTheme() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-toggle').textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        document.querySelector('.theme-toggle').textContent = '🌙';
    }
    
    saveUserData();
}