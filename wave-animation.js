function initWaveLiveAnimation() {
    const container = document.getElementById('wave-animation-container');
    if (!container) return;

    // Делаем саму вкладку "Моя Волна" полностью глубокого черного цвета
    const waveTabSection = container.closest('#tab-wave');
    if (waveTabSection) {
        waveTabSection.style.backgroundColor = '#000000';
        waveTabSection.style.backgroundImage = 'none';
        waveTabSection.style.backdropFilter = 'none';
        waveTabSection.style.webkitBackdropFilter = 'none';
        // Убираем внутренние границы, если они накладывались поверх
        waveTabSection.style.border = 'none';
    }

    // Ссылка на твою GIF-анимацию волны из хранилища Vercel
    const gifUrl = "https://hlx6folrupjwnm6y.public.blob.vercel-storage.com/fmahalem.gif";

    let waveImg = document.getElementById('wave-gif-element');
    if (!waveImg) {
        container.innerHTML = ''; // Полностью очищаем контейнер от старых тестов
        
        waveImg = document.createElement('img');
        waveImg.id = 'wave-gif-element';
        waveImg.src = gifUrl;
        
        // ИСПРАВЛЕНО: Задали средний аккуратный размер (max-width: 380px) и центрирование
        waveImg.style.cssText = `
            width: 100%;
            max-width: 380px;
            height: auto;
            object-fit: contain;
            filter: drop-shadow(0 0 20px rgba(255, 42, 116, 0.4));
            transition: filter 0.3s ease;
        `;
        container.appendChild(waveImg);
        
        // Подгоняем контейнер строго по центру
        container.style.width = '100%';
        container.style.maxWidth = '380px';
        container.style.height = 'auto';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        
        // Гарантируем, что кнопка включения под гифкой не сдвинется криво
        if (container.parentElement) {
            container.parentElement.style.justifyContent = 'center';
        }
    }

    // Умное управление воспроизведением GIF в зависимости от статуса плеера
    const audio = document.getElementById('audio');
    if (audio) {
        if (!audio.paused) {
            // Если музыка играет — включаем анимацию (убираем заморозку)
            waveImg.style.filter = "drop-shadow(0 0 25px rgba(255, 42, 116, 0.6))";
            
            // Перезаписываем src той же ссылкой ТОЛЬКО если она была пустой, 
            // чтобы запустить анимацию, не вызывая постоянного мерцания картинки
            if (waveImg.src.includes('#paused')) {
                waveImg.src = gifUrl + "?t=" + Date.now();
            }
        } else {
            // Если пауза — "замораживаем" GIF, добавляя хэш к ссылке. 
            // Браузер воспримет её как статичный кадр и остановит движение
            if (!waveImg.src.includes('#paused')) {
                waveImg.src = gifUrl + "#paused";
                waveImg.style.filter = "drop-shadow(0 0 10px rgba(255, 42, 116, 0.15)) opacity(0.7)";
            }
        }
    }
}

// Запускаем проверку состояния плеера каждые 300 миллисекунд для мгновенного отклика на клик Play/Pause
setInterval(initWaveLiveAnimation, 300);
