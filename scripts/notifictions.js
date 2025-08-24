// Verificar si las notificaciones son compatibles
function checkNotificationSupport() {
    if (!("Notification" in window)) {
        console.log("Este navegador no soporta notificaciones");
        return false;
    }
    return true;
}

// Solicitar permiso para notificaciones
function requestNotificationPermission() {
    if (!checkNotificationSupport()) {
        showMessage('Tu navegador no soporta notificaciones 😢', 'error');
        return;
    }
    
    Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
            console.log("Permiso para notificaciones concedido");
            // Guardar preferencia de notificaciones
            if (currentUser) {
                allUsers[currentUser].notifications = true;
                localStorage.setItem('dailyQuoteUsers', JSON.stringify(allUsers));
            }
            // Programar notificaciones diarias
            scheduleDailyNotification();
            showMessage('¡Notificaciones activadas! Recibirás tu frase diaria a las 6:00 AM 🌅', 'success');
        } else {
            showMessage('Permiso para notificaciones denegado. Puedes activarlas más tarde en configuración.', 'warning');
        }
    });
}

// Programar notificación diaria a las 6:00 AM
function scheduleDailyNotification() {
    // Limpiar timer existente
    if (notificationTimer) {
        clearTimeout(notificationTimer);
    }
    
    // Calcular el tiempo hasta las 6:00 AM del próximo día
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(6, 0, 0, 0);
    
    // Si ya pasaron las 6:00 AM hoy, programar para mañana
    if (now.getHours() >= 6) {
        targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const timeUntilNotification = targetTime.getTime() - now.getTime();
    
    // Programar la notificación
    notificationTimer = setTimeout(async () => {
        // Obtener la frase del día
        const quote = await getQuoteForDate(new Date());
        const notificationTitle = `💖 Tu Frase Diaria 💖`;
        const notificationBody = `${quote.split(',')[0]}...`;
        
        // Crear la notificación
        if (Notification.permission === "granted") {
            const notification = new Notification(notificationTitle, {
                body: notificationBody,
                icon: 'assets/icon.png', // Asegúrate de tener este archivo
                tag: 'daily-quote'
            });
            
            // Al hacer clic en la notificación, abrir la aplicación
            notification.onclick = function() {
                window.focus();
                notification.close();
                
                // Si la aplicación está minimizada, restaurarla
                if (document.hidden) {
                    // Esto funciona mejor en entornos móviles
                    window.location.reload();
                }
            };
        }
        
        // Programar la próxima notificación
        scheduleDailyNotification();
    }, timeUntilNotification);
    
    console.log(`Notificación programada para ${targetTime}`);
}