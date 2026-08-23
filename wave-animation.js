function initWaveLiveAnimation() {
    const container = document.getElementById('wave-animation-container');
    if (!container) return;

    // Ссылка на твою GIF-анимацию волны из хранилища Vercel
    const gifUrl = "https://vercel-storage.com";

    // ПРИНУДИТЕЛЬНО: Делаем саму вкладку и ВСЁ пространство вокруг неё абсолютно угольно-черным
    const waveTabSection = container.closest('#tab-wave');
    if (waveTabSection) {
        waveTabSection.style.setProperty('background', '#000000', 'important');
        waveTabSection.style.setProperty('background-color', '#000000', 'important');
        waveTabSection.style.setProperty('background-image', 'none', 'important');
        waveTabSection.style.setProperty('backdrop-filter', 'none', 'important');
        waveTabSection.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
        waveTabSection.style.setProperty('border', 'none', 'important');
    }

    // Очищаем фоновый контейнер всего плеера, если мы находимся на этой вкладке
    const mainContent = document.querySelector('.main-content');
    if (mainContent && waveTabSection && waveTabSection.classList.contains('active')) {
        mainContent.style.setProperty('background', '#000000', 'important');
        mainContent.style.setProperty('background-color', '#000000', 'important');
    }

    let waveImg = document.getElementById('wave-gif-element');
    if (!waveImg) {
        container.innerHTML = ''; // Стираем старые остатки
        
        waveImg = document.createElement('img');
        waveImg.id = 'wave-gif-element';
        waveImg.src = gifUrl;
        
        // ЧЁТКИЙ СРЕДНИЙ РАЗМЕР: max-width: 320px для идеального баланса по центру экрана
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
        
        // ВЫРАВНИВАНИЕ ПО ЦЕНТРУ: Располагаем контейнер ровно по центру черного экрана
        container.style.cssText = `
            width: 100% !important;
            max-width: 320px !important;
            height: auto !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin: auto !important;
        `;
        
        // Центрируем родительский блок для ровного положения кнопки и гифки
        if (container.parentElement) {
            container.parentElement.style.cssText = `
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                height: 100% !important;
                gap: 30px !important;
                background: #000000 !important;
            `;
        }
    }

    // Умное управление анимацией при клике на Play/Pause
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

// Повысили скорость отклика до 200мс, чтобы изменения применялись мгновенно
setInterval(initWaveLiveAnimation, 200);
