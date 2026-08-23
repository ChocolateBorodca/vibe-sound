let animationFrameId = null;
let wavePhase = 0;

function initWaveLiveAnimation() {
    const waveTabSection = document.getElementById('tab-wave');
    const mainContent = document.querySelector('.main-content');
    const audio = document.getElementById('audio');
    const waveContainer = document.getElementById('wave-container');

    const isWaveTabActive = waveTabSection && waveTabSection.classList.contains('active');

    if (isWaveTabActive) {
        // Окрашиваем вкладку и контент строго в черный цвет
        if (mainContent) {
            mainContent.style.setProperty('background', '#000000', 'important');
            mainContent.style.setProperty('background-color', '#000000', 'important');
        }
        if (waveTabSection) {
            waveTabSection.style.setProperty('background', '#000000', 'important');
            waveTabSection.style.setProperty('background-color', '#000000', 'important');
            waveTabSection.style.setProperty('backdrop-filter', 'none', 'important');
            waveTabSection.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
            waveTabSection.style.setProperty('border', 'none', 'important');
        }
    } else {
        // Возвращаем родное матовое стекло плеера на Главной
        if (mainContent) {
            mainContent.style.removeProperty('background');
            mainContent.style.removeProperty('background-color');
        }
        if (waveTabSection) {
            waveTabSection.style.removeProperty('background');
            waveTabSection.style.removeProperty('background-color');
            waveTabSection.style.removeProperty('backdrop-filter');
            waveTabSection.style.removeProperty('-webkit-backdrop-filter');
            waveTabSection.style.removeProperty('border');
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        return;
    }

    if (!waveContainer) return;

    // Внедряем холст Canvas строго внутрь твоего wave-container
    let canvas = document.getElementById('wave-visual-canvas');
    if (!canvas) {
        waveContainer.innerHTML = ''; 
        canvas = document.createElement('canvas');
        canvas.id = 'wave-visual-canvas';
        canvas.width = 600;
        canvas.height = 300;
        canvas.style.cssText = `
            display: block !important;
            max-width: 100% !important;
            height: auto !important;
            box-shadow: 0 0 50px rgba(255, 42, 116, 0.15);
            border-radius: 20px !important;
        `;
        waveContainer.appendChild(canvas);
    }

    // Запускаем бесконечный цикл анимации нитей
    if (!animationFrameId) {
        drawPureMathematicalWave();
    }
}

// Автономный рендеринг неоновых нитей Liquid Glass
function drawPureMathematicalWave() {
    const canvas = document.getElementById('wave-visual-canvas');
    const audio = document.getElementById('audio');
    
    if (!canvas) {
        animationFrameId = null;
        return;
    }

    animationFrameId = requestAnimationFrame(drawPureMathematicalWave);
    const ctx = canvas.getContext('2d');
    const isPlaying = audio && !audio.paused;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // В тишине нити едва дышат (сила 2), при старте музыки — раскачиваются неоновыми волнами (сила 35)
    let globalPower = isPlaying ? 35 : 2;
    
    // Если включена Моя Волна, добавляем еще больше амплитуды (сила 50)
    if (typeof isWaveActive !== 'undefined' && isWaveActive && isPlaying) {
        globalPower = 50;
    }

    // Наращиваем фазу (скорость бега волны зависит от того, поет ли трек)
    wavePhase += isPlaying ? 0.04 : 0.005;

    // Рисуем 3 независимых переплетающихся неоновых слоя из твоего примера
    for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.lineWidth = 3 - j;
        
        // Палитра Яндекс Вайб: Розовый, Фиолетовый, Бирюзовый
        ctx.strokeStyle = j === 0 ? 'rgba(255, 42, 116, 0.8)' : (j === 1 ? 'rgba(138, 43, 226, 0.6)' : 'rgba(0, 245, 255, 0.5)');
        ctx.shadowBlur = j === 0 ? 20 : 0;
        ctx.shadowColor = '#ff2a74';

        const totalPoints = 40;
        const sliceWidth = canvas.width / totalPoints;
        let x = 0;

        for (let i = 0; i <= totalPoints; i++) {
            // Математическая синусоида, создающая холмы и переплетения нитей
            let sineValue = Math.sin(i * 0.15 + wavePhase + j * 1.5);
            let cosModifier = Math.cos(i * 0.05 - wavePhase * 0.5);
            
            let y = (canvas.height / 2) + (sineValue * cosModifier * globalPower);

            // Мягкое сужение краев к центру (как в оригинале Моей Волны)
            let edgeFade = Math.sin((x / canvas.width) * Math.PI);
            y = (canvas.height / 2) + (y - (canvas.height / 2)) * edgeFade;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            x += sliceWidth;
        }
        ctx.stroke();
    }
}

// Запускаем бесконечный триггер отслеживания
setInterval(initWaveLiveAnimation, 300);
