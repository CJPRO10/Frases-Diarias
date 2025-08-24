// Cargar todos los usuarios del sistema
function loadAllUsers() {
    const savedUsers = localStorage.getItem('dailyQuoteUsers');
    if (savedUsers) {
        allUsers = JSON.parse(savedUsers);
    }
}

// Mostrar formulario de registro
function showRegisterForm() {
    document.getElementById('registerForm').style.display = 'block';
}

// Registrar nuevo usuario
function registerUser() {
    const username = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const nickname = document.getElementById('registerNickname').value.trim();
    
    if (!username || !password || !nickname) {
        showMessage('Por favor, completa todos los campos 💕', 'error');
        return;
    }
    
    if (username.length < 2) {
        showMessage('El nombre de usuario debe tener al menos 2 caracteres 💖', 'error');
        return;
    }
    
    if (allUsers[username]) {
        showMessage('Este usuario ya existe. Por favor, elige otro nombre.', 'error');
        return;
    }
    
    // Crear nuevo usuario (en un caso real, deberías hashear la contraseña)
    const newUser = {
        password: password, // En producción, esto debería ser un hash
        nickname: nickname,
        favorites: {},
        personalQuotes: [],
        quotesCache: {},
        stats: {
            totalDays: 0,
            favorites: 0,
            personal: 0,
            createdDate: new Date().toISOString()
        },
        theme: 'light',
        notifications: false
    };
    
    allUsers[username] = newUser;
    localStorage.setItem('dailyQuoteUsers', JSON.stringify(allUsers));
    
    // Iniciar sesión automáticamente
    loginAsUser(username);
    
    // Mostrar opción de notificaciones
    document.getElementById('notificationPermission').style.display = 'block';
    
    showMessage(`¡Cuenta creada con éxito! Bienvenida ${nickname} ✨`, 'success');
}

// Iniciar sesión
function login() {
    const username = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showMessage('Por favor, ingresa usuario y contraseña 💕', 'error');
        return;
    }
    
    if (!allUsers[username]) {
        showMessage('Usuario no encontrado. ¿Quieres crear una cuenta?', 'error');
        return;
    }
    
    if (allUsers[username].password !== password) {
        showMessage('Contraseña incorrecta. Por favor, intenta nuevamente.', 'error');
        return;
    }
    
    loginAsUser(username);
    showMessage(`¡Bienvenida de nuevo ${allUsers[username].nickname}! 💖`, 'success');
}

// Verificar sesión actual
function checkCurrentSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser && allUsers[savedUser]) {
        loginAsUser(savedUser);
    } else {
        showLoginScreen();
    }
}

// Mostrar pantalla de login
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
}

// Iniciar sesión como usuario
function loginAsUser(username) {
    currentUser = username;
    localStorage.setItem('currentUser', currentUser);
    
    // Cargar datos del usuario
    const userData = allUsers[username];
    currentNickname = userData.nickname;
    favorites = userData.favorites || {};
    personalQuotes = userData.personalQuotes || [];
    quotesCache = userData.quotesCache || {};
    
    // Aplicar tema
    if (userData.theme === 'dark') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-toggle').textContent = '☀️';
    } else {
        isDarkMode = false;
        document.body.classList.remove('dark-mode');
        document.querySelector('.theme-toggle').textContent = '🌙';
    }
    
    updateUserInfo();
    
    // Ocultar login y mostrar app principal
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Cargar frase del día
    loadTodayQuote();
    
    // Programar notificaciones si están activadas
    if (userData.notifications) {
        scheduleDailyNotification();
    }
}

// Actualizar información del usuario en pantalla
function updateUserInfo() {
    document.getElementById('currentUserName').textContent = currentUser;
    document.getElementById('userInfo').style.display = 'block';
}

// Cerrar sesión
function logout() {
    // Guardar datos antes de cerrar sesión
    saveUserData();
    
    // Limpiar timer de notificaciones
    if (notificationTimer) {
        clearTimeout(notificationTimer);
        notificationTimer = null;
    }
    
    // Limpiar variables
    currentUser = null;
    currentNickname = '';
    favorites = {};
    personalQuotes = [];
    quotesCache = {};
    
    // Limpiar localStorage
    localStorage.removeItem('currentUser');
    
    // Mostrar pantalla de login
    showLoginScreen();
    
    showMessage('Sesión cerrada correctamente. ¡Vuelve pronto! 👋', 'info');
}

// Guardar datos del usuario actual
function saveUserData() {
    if (!currentUser || !allUsers[currentUser]) return;
    
    allUsers[currentUser].nickname = currentNickname;
    allUsers[currentUser].favorites = favorites;
    allUsers[currentUser].personalQuotes = personalQuotes;
    allUsers[currentUser].quotesCache = quotesCache;
    allUsers[currentUser].theme = isDarkMode ? 'dark' : 'light';
    
    // Actualizar estadísticas
    allUsers[currentUser].stats = {
        ...allUsers[currentUser].stats,
        totalDays: Object.keys(quotesCache).length,
        favorites: Object.keys(favorites).length,
        personal: personalQuotes.length
    };
    
    localStorage.setItem('dailyQuoteUsers', JSON.stringify(allUsers));
}