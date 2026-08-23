function initWaveLiveAnimation() {
    const container = document.getElementById('wave-animation-container');
    if (!container) return;

    // Ссылка на твою GIF-анимацию волны из хранилища Vercel
    const gifUrl = "https://hlx6folrupjwnm6y.public.blob.vercel-storage.com/LIB6492.gif";

    let waveImg = document.getElementById('wave-gif-element');
    if (!waveImg) {
        container.innerHTML = ''; // Полностью очищаем контейнер от старых тестов
        
        waveImg = document.createElement('img');
        waveImg.id = 'wave-gif-element';
        waveImg.src = gifUrl;
        
        // Стилизуем гифку под панорамный неоновый шлейф со свечением
        waveImg.style.cssText = `
            width: 100%;
            max-width: 500px;
            height: auto;
            object-fit: contain;
            filter: drop-shadow(0 0 20px rgba(255, 42, 116, 0.4));
            transition: filter 0.3s ease;
        `;
        container.appendChild(waveImg);
        
        // Подгоняем размеры контейнера под горизонтальную волну
        container.style.width = '100%';
        container.style.maxWidth = '500px';
        container.style.height = 'auto';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
    }

    // Умное управление воспроизведением GIF в зависимости от статуса плеера
    const audio = document.getElementById('audio');
    if (audio) {
        if (!audio.paused) {
            // Если музыка играет — включаем анимацию (убираем заморозку)
            waveImg.style.filter = "drop-shadow(0 0 25px rgba(255, 42, 116, 0.6))";
            
            // Хитрость: Перезаписываем src той же ссылкой ТОЛЬКО если она была пустой, 
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
