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
    
    // Берем твой новый контейнер напрямую из HTML
    const waveContainer = document.getElementById('wave-container');

    const isWaveTabActive = waveTabSection && waveTabSection.classList.contains('active');

    if (isWaveTabActive) {
        // Делаем весь экран вокруг контейнера чисто черным, чтобы подчеркнуть неон
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
        // Возвращаем стандартное стекло плеера, когда уходим на Главную или Любимое
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

    // Инжектируем Canvas внутрь твоего контейнера
    let canvas = document.getElementById('wave-visual-canvas');
    if (!canvas) {
        waveContainer.innerHTML = ''; // Очищаем от старых тестов
        canvas = document.createElement('canvas');
        canvas.id = 'wave-visual-canvas';
        canvas.width = 600;
        canvas.height = 300;
        canvas.style.cssText = `
            display: block !important;
            max-width: 100% !important;
            height: auto !important;
            box-shadow: 0 0 50px rgba(255, 40, 100, 0.25);
            border-radius: 20px !important;
        `;
        waveContainer.appendChild(canvas);
    }

    // Инициализация Web Audio API частот
    if (!isAudioContextInitialized && audio) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            
            audio.crossOrigin = "anonymous";
            
            source = audioCtx.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            analyser.fftSize = 256;
            
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            isAudioContextInitialized = true;
        } catch (e) {
            console.log("AudioContext ожидает старта песни");
        }
    }

    // Запускаем отрисовку частот
    if (audio && !audio.paused && !animationFrameId && isAudioContextInitialized) {
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        drawAdvancedRhythmWave();
    }
}

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

    // Отрисовка 3-х наложенных неоновых линий из твоего примера кода
    for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.lineWidth = 3 - j;
        
        ctx.strokeStyle = `rgba(255, ${40 + j * 60}, ${100 + j * 50}, ${0.8 - j * 0.2})`;
        ctx.shadowBlur = j === 0 ? 25 : 0;
        ctx.shadowColor = `rgba(255, 40, 100, 0.6)`;

        let sliceWidth = canvas.width / dataArray.length;
        let x = 0;

        phase += 0.02; // Скорость бега нитей

        for (let i = 0; i < dataArray.length; i++) {
            let v = dataArray[i] / 128.0;
            
            // Расчет плавного синусоидального изгиба
            let y = (canvas.height / 2) + (v * (avg * 0.38) * Math.sin(i * 0.06 + phase + j));

            // Органическое сужение краев к краям холста
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

// Запускаем цикл проверки
setInterval(initWaveLiveAnimation, 300);
