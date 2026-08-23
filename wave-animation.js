function initWaveLiveAnimation() {
    // Ссылка на твою GIF-анимацию волны из хранилища Vercel
    const gifUrl = "https://vercel-storage.com";
    
    const waveTabSection = document.getElementById('tab-wave');
    const mainContent = document.querySelector('.main-content');

    // Проверяем, открыта ли сейчас вкладка "Моя Волна"
    const isWaveTabActive = waveTabSection && waveTabSection.classList.contains('active');

    if (isWaveTabActive) {
        // ИСПРАВЛЕНО: Красим в чёрный цвет ТОЛЬКО когда открыта вкладка Моя Волна
        if (mainContent) {
            mainContent.style.setProperty('background', '#000000', 'important');
            mainContent.style.setProperty('background-color', '#000000', 'important');
        }
        if (waveTabSection) {
            waveTabSection.style.setProperty('background', '#000000', 'important');
            waveTabSection.style.setProperty('background-color', '#000000', 'important');
            waveTabSection.style.setProperty('background-image', 'none', 'important');
            waveTabSection.style.setProperty('backdrop-filter', 'none', 'important');
            waveTabSection.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            waveTabSection.style.setProperty('border', 'none', 'important');
        }
    } else {
        // ИСПРАВЛЕНО: Если ушли на другую вкладку — полностью возвращаем стандартный прозрачный стиль
        if (mainContent) {
            mainContent.style.removeProperty('background');
            mainContent.style.removeProperty('background-color');
        }
        if (waveTabSection) {
            waveTabSection.style.removeProperty('background');
            waveTabSection.style.removeProperty('background-color');
            waveTabSection.style.removeProperty('background-image');
            waveTabSection.style.removeProperty('backdrop-filter');
            waveTabSection.style.removeProperty('-webkit-backdrop-filter');
            waveTabSection.style.removeProperty('border');
        }
        return; // Если вкладка закрыта, дальше код гифки не выполняем
    }

    // ИСПРАВЛЕНО: Если контейнера для анимации ещё нет в HTML, создаем его принудительно прямо сейчас
    let container = document.getElementById('wave-animation-container');
    if (!container && waveTabSection) {
        container = document.createElement('div');
        container.id = 'wave-animation-container';
        // Вставляем перед кнопкой включения волны
        const centerBtn = document.getElementById('wave-center-toggle-btn');
        if (centerBtn) {
            waveTabSection.insertBefore(container, centerBtn);
        } else {
            waveTabSection.appendChild(container);
        }
    }

    if (!container) return;

    let waveImg = document.getElementById('wave-gif-element');
    if (!waveImg) {
        container.innerHTML = ''; 
        
        waveImg = document.createElement('img');
        waveImg.id = 'wave-gif-element';
        waveImg.src = gifUrl;
        
        // ЧЁТКИЙ СРЕДНИЙ РАЗМЕР И ЦЕНТРИРОВАНИЕ
        waveImg.style.cssText = `
            width: 100% !important;
            max-width: 320px !important;
            height: auto !important;
            object-fit: contain !important;
            display: block !important;
            margin: 0 auto !important;
            filter: drop-shadow(0 0 20px rgba(255, 42, 116, 0.4));
            transition: filter 0.3s ease;
        `;
        container.appendChild(waveImg);
        
        container.style.cssText = `
            width: 100% !important;
            max-width: 320px !important;
            height: auto !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin: auto !important;
        `;
        
        if (container.parentElement) {
            container.parentElement.style.setProperty('display', 'flex', 'important');
            container.parentElement.style.setProperty('flex-direction', 'column', 'important');
            container.parentElement.style.setProperty('align-items', 'center', 'important');
            container.parentElement.style.setProperty('justify-content', 'center', 'important');
            container.parentElement.style.setProperty('height', '100%', 'important');
            container.parentElement.style.setProperty('gap', '30px', 'important');
            container.parentElement.style.setProperty('background', '#000000', 'important');
        }
    }

    // Управление воспроизведением гифки при клике на Play/Pause
    const audio = document.getElementById('audio');
    if (audio) {
        if (!audio.paused) {
            waveImg.style.filter = "drop-shadow(0 0 25px rgba(255, 42, 116, 0.6))";
            if (waveImg.src.includes('#paused')) {
                waveImg.src = gifUrl + "?t=" + Date.now();
            }
        } else {
            if (!waveImg.src.includes('#paused')) {
                waveImg.src = gifUrl + "#paused";
                waveImg.style.filter = "drop-shadow(0 0 10px rgba(255, 42, 116, 0.15)) opacity(0.7)";
            }
        }
    }
}

// Запускаем постоянную проверку вкладок и анимации
setInterval(initWaveLiveAnimation, 200);
