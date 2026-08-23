let waveIntervalId = null;

function initWaveLiveAnimation() {
    const waveTabSection = document.getElementById('tab-wave');
    const mainContent = document.querySelector('.main-content');

    const isWaveTabActive = waveTabSection && waveTabSection.classList.contains('active');

    if (isWaveTabActive) {
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
        // Если ушли с вкладки — останавливаем анимацию, чтобы не грузить телефон
        if (waveIntervalId) {
            clearInterval(waveIntervalId);
            waveIntervalId = null;
        }
        return;
    }

    let container = document.getElementById('wave-animation-container');
    if (!container && waveTabSection) {
        container = document.createElement('div');
        container.id = 'wave-animation-container';
        const centerBtn = document.getElementById('wave-center-toggle-btn');
        if (centerBtn) waveTabSection.insertBefore(container, centerBtn);
        else waveTabSection.appendChild(container);
    }

    if (!container) return;

    // Вместо картинки создаем внутренний блок для полос эквалайзера
    let barsWrapper = document.getElementById('wave-bars-wrapper');
    if (!barsWrapper) {
        container.innerHTML = ''; // Стираем старые остатки картинок
        
        barsWrapper = document.createElement('div');
        barsWrapper.id = 'wave-bars-wrapper';
        
        // Стилизуем контейнер под горизонтальную линию звука по центру
        barsWrapper.style.cssText = `
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 3px !important;
            width: 100% !important;
            max-width: 450px !important;
            height: 160px !important;
            margin: 0 auto !important;
        `;

        // Создаем 65 аккуратных вертикальных полос, как на фото
        for (let i = 0; i < 65; i++) {
            const bar = document.createElement('div');
            bar.className = 'vibe-wave-bar';
            bar.style.cssText = `
                width: 3px !important;
                height: 4px !important;
                background-color: #ffffff !important;
                border-radius: 2px !important;
                transition: height 0.1s ease, background-color 0.2s ease !important;
                box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
            `;
            barsWrapper.appendChild(bar);
        }
        
        container.appendChild(barsWrapper);

        container.style.cssText = `
            width: 100% !important;
            max-width: 450px !important;
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

    // Запускаем постоянный цикл прыжков эквалайзера, если он еще не запущен
    if (!waveIntervalId) {
        waveIntervalId = setInterval(updateWaveBarsRhythm, 100);
    }
}

// Математическая функция генерации плавных волн и прыжков под ритм
function updateWaveBarsRhythm() {
    const bars = document.querySelectorAll('.vibe-wave-bar');
    if (bars.length === 0) return;

    const audio = document.getElementById('audio');
    const isPlaying = audio && !audio.paused;

    // Сила прыжка: если музыка на паузе — полосы превращаются в ровную тонкую линию
    let maxBaseHeight = isPlaying ? 110 : 4;
    let waveModifier = isPlaying ? 25 : 0;

    // Включаем хаотичную синусоиду, чтобы полосы собирались в красивые холмики, как на твоем фото
    const time = Date.now() * 0.004;

    bars.forEach((bar, index) => {
        let height = 4;

        if (isPlaying) {
            // Формула создает три независимых бугорка, которые плавают по всей длине эквалайзера
            let hill1 = Math.sin(index * 0.15 - time) * 0.5 + 0.5;
            let hill2 = Math.cos(index * 0.08 + time * 1.3) * 0.3 + 0.3;
            let randomJitter = Math.random() * 0.4; // Легкое дрожание для эффекта живого звука

            height = (hill1 * 0.6 + hill2 * 0.4 + randomJitter) * maxBaseHeight;
            if (height < 4) height = 4;

            // Накручиваем неоновую подсветку: центральные пики окрашиваются в фирменный розовый неон
            if (height > 50) {
                bar.style.setProperty('background-color', '#ff2a74', 'important');
                bar.style.setProperty('box-shadow', '0 0 12px rgba(255, 42, 116, 0.7)', 'important');
            } else {
                bar.style.setProperty('background-color', '#ffffff', 'important');
                bar.style.setProperty('box-shadow', '0 0 8px rgba(255, 255, 255, 0.3)', 'important');
            }
        } else {
            // Если пауза — возвращаем всё в дефолтную белую линию
            bar.style.setProperty('background-color', '#ffffff', 'important');
            bar.style.setProperty('box-shadow', '0 0 4px rgba(255, 255, 255, 0.2)', 'important');
        }

        bar.style.setProperty('height', `${height}px`, 'important');
    });
}

// Запускаем постоянную проверку активности вкладки
setInterval(initWaveLiveAnimation, 300);
