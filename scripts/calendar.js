// Actualizar calendario
function updateCalendar() {
    const calendarTitle = document.getElementById('calendarTitle');
    const calendarGrid = document.getElementById('calendarGrid');
    
    // Configurar título
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Obtener primer día del mes y cantidad de días
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    // Crear encabezados de días
    let html = '';
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    dayNames.forEach(day => {
        html += `<div style="text-align: center; font-weight: bold; padding: 10px;">${day}</div>`;
    });
    
    // Espacios vacíos para días anteriores al primer día del mes
    for (let i = 0; i < startingDay; i++) {
        html += `<div class="calendar-day unavailable"></div>`;
    }
    
    // Días del mes
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(currentYear, currentMonth, day);
        const dateStringISO = dateObj.toISOString().split('T')[0];
        
        let classes = 'calendar-day';
        
        // Verificar si es hoy
        if (dateStringISO === todayString) {
            classes += ' today';
        }
        
        // Verificar si hay frase para este día
        if (quotesCache[dateStringISO] || dateObj <= today) {
            classes += ' available';
        } else {
            classes += ' unavailable';
        }
        
        html += `<div class="${classes}" onclick="selectDate('${dateStringISO}')">${day}</div>`;
    }
    
    calendarGrid.innerHTML = html;
}

// Cambiar mes en el calendario
function changeMonth(direction) {
    currentMonth += direction;
    
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    updateCalendar();
}

// Seleccionar fecha en el calendario
async function selectDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    
    // No permitir seleccionar fechas futuras
    if (date > today) {
        showMessage('No puedes seleccionar una fecha futura. 🚫', 'warning');
        return;
    }
    
    // Obtener la frase para la fecha seleccionada
    const quoteElement = document.getElementById('quoteText');
    const dateElement = document.getElementById('quoteDate');
    const favoriteBtn = document.getElementById('favoriteBtn');
    
    quoteElement.textContent = 'Cargando frase...';
    selectedDate = date;
    
    try {
        const quote = await getQuoteForDate(date);
        quoteElement.textContent = quote;
        dateElement.textContent = formatDate(date);
        
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
        
        // Mostrar sección de hoy
        showSection('today');
    } catch (error) {
        console.error('Error loading quote:', error);
        quoteElement.textContent = 'No se pudo cargar la frase para este día. Intenta nuevamente. 💖';
        dateElement.textContent = formatDate(date);
    }
}