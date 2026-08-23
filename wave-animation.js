let audioCtx = null;
let analyser = null;
let source = null;
let dataArray = null;
let isAudioContextInitialized = false;
let animationFrameId = null;
let phase = 0;

function initWaveLiveAnimation() {
    const waveTabSection = document.getElementById('tab-wave');
    const mainContent = document.querySelector('.main-content');
    const audio = document.getElementById('audio');

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
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
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

    let canvas = document.getElementById('wave-visual-canvas');
    if (!canvas) {
        container.innerHTML = '';
        canvas = document.createElement('canvas');
        canvas.id = 'wave-visual-canvas';
        canvas.width = 600;
        canvas.height = 300;
        canvas.style.cssText = `
            display: block !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            height: auto !important;
            box-shadow: 0 0 50px rgba(255, 40, 100, 0.2);
            border-radius: 20px !important;
        `;
        container.appendChild(canvas);

        container.style.cssText = `
            width: 100% !important;
            max-width: 600px !important;
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

    // Инициализируем анализатор частот Web Audio API, привязываясь к плееру
    if (!isAudioContextInitialized && audio) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            
            // Задаем важный параметр CORS, чтобы браузер разрешал читать частоты трека
            audio.crossOrigin = "anonymous";
            
            source = audioCtx.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            analyser.fftSize = 256;
            
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            isAudioContextInitialized = true;
        } catch (e) {
            console.log("AudioContext инициализируется после старта трека");
        }
    }

    // Запускаем перерисовку волны, если плеер играет и вкладка открыта
    if (audio && !audio.paused && !animationFrameId && isAudioContextInitialized) {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        drawAdvancedRhythmWave();
    }
}

// Перенос математического алгоритма Яндекса и твоего примера
function drawAdvancedRhythmWave() {
    const canvas = document.getElementById('wave-visual-canvas');
    const audio = document.getElementById('audio');
    if (!canvas || !audio || audio.paused) {
        animationFrameId = null;
        return;
    }

    animationFrameId = requestAnimationFrame(drawAdvancedRhythmWave);
    const ctx = canvas.getContext('2d');

    if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
    } else {
        return;
    }
    
    let sum = dataArray.reduce((a, b) => a + b, 0);
    let avg = sum / dataArray.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка трех наложенных неоновых линий из твоего примера
    for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.lineWidth = 4 - j;
        
        // Красивое неоновое свечение струн
        ctx.strokeStyle = `rgba(255, ${40 + j * 60}, ${100 + j * 50}, ${0.8 - j * 0.2})`;
        ctx.shadowBlur = j === 0 ? 15 : 0;
        ctx.shadowColor = `rgba(255, 40, 100, 0.5)`;

        let sliceWidth = canvas.width / dataArray.length;
        let x = 0;

        phase += 0.015; // базовая скорость движения волн

        for (let i = 0; i < dataArray.length; i++) {
            let v = dataArray[i] / 128.0;
            
            // Расчет высоты волны по частотам твоего примера
            let y = (canvas.height / 2) + (v * (avg * 0.4) * Math.sin(i * 0.08 + phase + j));

            // Плавное сужение краев к центру (как у оригинальной Моей Волны)
            let edgeFade = Math.sin((x / canvas.width) * Math.PI);
            y = (canvas.height / 2) + (y - (canvas.height / 2)) * edgeFade;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        ctx.stroke();
    }
}

// Интервал проверки активности
setInterval(initWaveLiveAnimation, 300);
