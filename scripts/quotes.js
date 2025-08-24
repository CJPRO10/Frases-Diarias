// APIs de frases
const quoteAPIs = {
    primary: {
        name: 'QuoteGarden',
        url: 'https://quotegarden.herokuapp.com/api/v3/quotes',
        categories: ['love', 'motivational', 'inspirational', 'happiness'],
        format: (data) => data.data && data.data.length > 0 ? data.data[0].quoteText : null
    },
    backup1: {
        name: 'Quotable',
        url: 'https://api.quotable.io/quotes',
        categories: ['motivational', 'inspirational', 'love', 'happiness'],
        format: (data) => data.results && data.results.length > 0 ? data.results[0].content : null
    },
    backup2: {
        name: 'ZenQuotes',
        url: 'https://zenquotes.io/api/random',
        format: (data) => Array.isArray(data) && data.length > 0 ? data[0].q : null
    }
};

// Función principal para obtener frase
async function getQuoteForDate(date) {
    const dateString = date.toISOString().split('T')[0];
    
    // Verificar si ya tenemos la frase en cache
    if (quotesCache[dateString]) {
        return `${quotesCache[dateString]}, ${currentNickname} ✨`;
    }

    let quote = null;

    // Intentar obtener frase de APIs
    try {
        quote = await fetchQuoteFromAPIs(dateString);
    } catch (error) {
        console.log('Error fetching from APIs:', error);
    }

    // Si no hay frase de API, usar frases personalizadas o de respaldo
    if (!quote) {
        quote = getLocalQuote(dateString);
    }

    // Guardar en cache
    quotesCache[dateString] = quote;
    saveUserData();

    return `${quote}, ${currentNickname} ✨`;
}

// Obtener frase de las APIs
async function fetchQuoteFromAPIs(dateString) {
    const seed = parseInt(dateString.replace(/-/g, ''));
    
    // Determinar qué API usar basado en la fecha
    const apiKeys = Object.keys(quoteAPIs);
    const selectedAPI = quoteAPIs[apiKeys[seed % apiKeys.length]];

    try {
        let url = selectedAPI.url;
        
        // Configurar URL según la API
        if (selectedAPI.name === 'QuoteGarden') {
            const category = selectedAPI.categories[seed % selectedAPI.categories.length];
            url += `?category=${category}&count=1`;
        } else if (selectedAPI.name === 'Quotable') {
            const tags = selectedAPI.categories.join(',');
            url += `?tags=${tags}&limit=1`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        return selectedAPI.format(data);
    } catch (error) {
        console.log(`Error with ${selectedAPI.name}:`, error);
        
        // Intentar con siguiente API
        for (let i = 1; i < apiKeys.length; i++) {
            const nextAPI = quoteAPIs[apiKeys[(seed + i) % apiKeys.length]];
            try {
                let url = nextAPI.url;
                
                if (nextAPI.name === 'QuoteGarden') {
                    const category = nextAPI.categories[seed % nextAPI.categories.length];
                    url += `?category=${category}&count=1`;
                } else if (nextAPI.name === 'Quotable') {
                    const tags = nextAPI.categories.join(',');
                    url += `?tags=${tags}&limit=1`;
                }

                const response = await fetch(url);
                if (!response.ok) continue;
                
                const data = await response.json();
                const quote = nextAPI.format(data);
                if (quote) return quote;
            } catch (e) {
                console.log(`Error with ${nextAPI.name}:`, e);
                continue;
            }
        }
        
        return null;
    }
}

// Obtener frase local (personal o de respaldo)
function getLocalQuote(dateString) {
    const seed = parseInt(dateString.replace(/-/g, ''));
    
    // Primero verificar si hay frases personales
    if (personalQuotes.length > 0) {
        const personalIndex = seed % personalQuotes.length;
        return personalQuotes[personalIndex];
    }
    
    // Usar frases de respaldo
    const fallbackIndex = seed % fallbackQuotes.length;
    return fallbackQuotes[fallbackIndex];
}

// Cargar la frase del día actual
async function loadTodayQuote() {
    const quoteElement = document.getElementById('quoteText');
    const dateElement = document.getElementById('quoteDate');
    const favoriteBtn = document.getElementById('favoriteBtn');
    
    quoteElement.textContent = 'Buscando tu frase especial...';
    
    try {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        const quote = await getQuoteForDate(today);
        
        quoteElement.textContent = quote;
        dateElement.textContent = formatDate(today);
        
        // Actualizar estado del botón de favoritos
        if (favorites[dateString]) {
            favoriteBtn.classList.add('favorited');
            favoriteBtn.querySelector('#heartIcon').textContent = '❤️';
            favoriteBtn.querySelector('span:last-child').textContent = ' Quitar de favoritas';
        } else {
            favoriteBtn.classList.remove('favorited');
            favoriteBtn.querySelector('#heartIcon').textContent = '🤍';
            favoriteBtn.querySelector('span:last-child').textContent = ' Marcar como favorita';
        }
    } catch (error) {
        console.error('Error loading quote:', error);
        quoteElement.textContent = 'Hoy el universo está preparando algo especial para ti. Vuelve en un momento 💖';
        dateElement.textContent = formatDate(new Date());
    }
}

// Alternar favorito
function toggleFavorite() {
    if (!currentUser) return;
    
    const dateString = new Date().toISOString().split('T')[0];
    const favoriteBtn = document.getElementById('favoriteBtn');
    
    if (favorites[dateString]) {
        delete favorites[dateString];
        favoriteBtn.classList.remove('favorited');
        favoriteBtn.querySelector('#heartIcon').textContent = '🤍';
        favoriteBtn.querySelector('span:last-child').textContent = ' Marcar como favorita';
        showMessage('Frase eliminada de favoritos 💔', 'info');
    } else {
        favorites[dateString] = quotesCache[dateString];
        favoriteBtn.classList.add('favorited');
        favoriteBtn.querySelector('#heartIcon').textContent = '❤️';
        favoriteBtn.querySelector('span:last-child').textContent = ' Quitar de favoritas';
        showMessage('¡Frase añadida a favoritos! 💖', 'success');
    }
    
    saveUserData();
}

// Mostrar sección específica
function showSection(section) {
    // Ocultar todas las secciones
    document.getElementById('todaySection').style.display = 'none';
    document.getElementById('calendarSection').style.display = 'none';
    document.getElementById('favoritesSection').style.display = 'none';
    document.getElementById('personalSection').style.display = 'none';
    
    // Desactivar todos los botones
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Mostrar sección seleccionada
    if (section === 'today') {
        document.getElementById('todaySection').style.display = 'block';
        buttons[0].classList.add('active');
        loadTodayQuote();
    } else if (section === 'calendar') {
        document.getElementById('calendarSection').style.display = 'block';
        buttons[1].classList.add('active');
        updateCalendar();
    } else if (section === 'favorites') {
        document.getElementById('favoritesSection').style.display = 'block';
        buttons[2].classList.add('active');
        loadFavorites();
    } else if (section === 'personal') {
        document.getElementById('personalSection').style.display = 'block';
        buttons[3].classList.add('active');
        loadPersonalQuotes();
    }
}

// Cargar favoritos
function loadFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    
    if (Object.keys(favorites).length === 0) {
        favoritesList.innerHTML = `
            <p style="text-align: center; color: #666; margin: 40px 0;">
                Aún no has marcado ninguna frase como favorita.<br>
                ¡Cuando encuentres una que te encante, guárdala aquí!
            </p>
        `;
        return;
    }
    
    let html = '';
    const sortedDates = Object.keys(favorites).sort().reverse();
    
    sortedDates.forEach(date => {
        const formattedDate = formatDate(new Date(date));
        html += `
            <div class="favorite-item">
                <div class="favorite-quote">${favorites[date]}, ${currentNickname} ✨</div>
                <div class="favorite-date">${formattedDate}</div>
            </div>
        `;
    });
    
    favoritesList.innerHTML = html;
}

// Cargar frases personales
function loadPersonalQuotes() {
    const personalList = document.getElementById('personalQuotesList');
    
    if (personalQuotes.length === 0) {
        personalList.innerHTML = `
            <p style="text-align: center; color: #666; margin: 40px 0;">
                Aún no has añadido frases personales.<br>
                ¡Crea frases especiales que aparecerán mezcladas con las otras!
            </p>
        `;
        return;
    }
    
    let html = '';
    
    personalQuotes.forEach((quote, index) => {
        html += `
            <div class="favorite-item">
                <div class="favorite-quote">${quote}</div>
                <button class="user-button" onclick="deletePersonalQuote(${index})" style="background: #e74c3c;">Eliminar</button>
            </div>
        `;
    });
    
    personalList.innerHTML = html;
}

// Añadir nueva frase personal
function addNewPersonalQuote() {
    const quoteInput = document.getElementById('personalQuote');
    const quote = quoteInput.value.trim();
    
    if (!quote) {
        showMessage('Por favor, escribe una frase 💖', 'error');
        return;
    }
    
    personalQuotes.push(quote);
    quoteInput.value = '';
    
    saveUserData();
    loadPersonalQuotes();
    
    showMessage('¡Frase añadida con éxito! Aparecerá aleatoriamente en tus días futuros ✨', 'success');
}

// Eliminar frase personal
function deletePersonalQuote(index) {
    if (confirm('¿Estás segura de que quieres eliminar esta frase?')) {
        personalQuotes.splice(index, 1);
        saveUserData();
        loadPersonalQuotes();
        showMessage('Frase eliminada correctamente', 'info');
    }
}