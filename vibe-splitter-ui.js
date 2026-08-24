let currentSplitterTrack = null;
let isSplitterActiveNow = false;

function renderSplitterScreen(trackObj) {
    currentSplitterTrack = trackObj;
    isSplitterActiveNow = true; // Включаем блокировку переключения треков плеера
    
    let splitterLayer = document.getElementById('vibe-splitter-screen');
    if (!splitterLayer) {
        splitterLayer = document.createElement('div');
        splitterLayer.id = 'vibe-splitter-screen';
        document.body.appendChild(splitterLayer);
    }

    splitterLayer.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:94vw; height:88vh; max-width:1200px; background:rgba(10,10,15,0.95); backdrop-filter:blur(40px); -webkit-backdrop-filter:blur(40px); border-radius:32px; border:1px solid rgba(255,255,255,0.12); z-index:999999; display:flex; flex-direction:column; padding:40px; color:#fff; box-shadow:0 40px 100px rgba(0,0,0,0.8);";

    splitterLayer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; width:100%;">
            <div>
                <h1 style="font-size:26px; font-weight:600; margin-bottom:4px; color:#fff;">Сплиттер трека</h1>
                <p style="font-size:14px; color:rgba(255,255,255,0.5); font-weight:500;">Разделение аудио на ИИ-дорожки</p>
            </div>
            <button class="upload-action-btn" id="close-splitter-btn" style="padding:10px 20px; font-size:14px; cursor:pointer;"><i data-lucide="x"></i> Закрыть сплиттер</button>
        </div>

        <div style="flex-grow:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:24px; width:100%;">
            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:20px 40px; border-radius:20px; text-align:center; max-width:500px; width:100%;">
                <div style="font-size:11px; color:#ff2a74; text-transform:uppercase; letter-spacing:1.5px; font-weight:600; margin-bottom:6px;">Выбранный аудиопоток</div>
                <div style="font-size:18px; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${trackObj.title}</div>
                <div style="font-size:13px; color:rgba(255,255,255,0.4); margin-top:2px;">${trackObj.artist}</div>
            </div>

            <div id="splitter-processing-block" style="width:100%; max-width:500px; text-align:center; margin-top:10px;">
                <button class="upload-action-btn" id="start-split-process-btn" style="background:#ff2a74; border-color:#ff2a74; padding:14px 40px; border-radius:30px; font-size:15px; font-weight:600; width:100%; justify-content:center; box-shadow:0 0 20px rgba(255,42,116,0.4);">
                    🧠 Разделить трек нейросетью Vibe AI
                </button>
                <div id="splitter-progress-container" style="display:none; margin-top:20px;">
                    <div style="font-size:12px; color:rgba(255,255,255,0.4); margin-bottom:8px;" id="splitter-status-text">Инициализация нейросети...</div>
                    <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
                        <div id="splitter-progress-bar" style="width:0%; height:100%; background:linear-gradient(90deg, #ff2a74, #00f5ff); border-radius:3px; transition:width 0.1s linear; box-shadow:0 0 10px #ff2a74;"></div>
                    </div>
                </div>
            </div>

            <!-- ИИ-Микшер -->
            <div id="splitter-mixer-block" style="display:none; width:100%; max-width:600px; background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.04); padding:24px; border-radius:24px; flex-direction:column; gap:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-size:11px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.5px;">🎛️ ИИ-Микшер стема</div>
                    <button class="upload-action-btn" style="padding:4px 12px; font-size:11px; cursor:pointer;" id="download-splitter-result-btn">📥 Скачать Стемы</button>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:16px; width:100%;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span style="font-size:13px; width:80px; color:rgba(255,255,255,0.6);">🎤 Вокал</span>
                        <input type="range" id="split-vol-vocal" min="0" max="100" value="100" style="flex-grow:1; accent-color:#ff2a74;">
                    </div>
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span style="font-size:13px; width:80px; color:rgba(255,255,255,0.6);">🎸 Мелодия</span>
                        <input type="range" id="split-vol-melody" min="0" max="100" value="100" style="flex-grow:1; accent-color:#8a2be2;">
                    </div>
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span style="font-size:13px; width:80px; color:rgba(255,255,255,0.6);">🥁 Ударные</span>
                        <input type="range" id="split-vol-drums" min="0" max="100" value="100" style="flex-grow:1; accent-color:#00f5ff;">
                    </div>
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span style="font-size:13px; width:80px; color:rgba(255,255,255,0.6);">🔊 Басы (808)</span>
                        <input type="range" id="split-vol-bass" min="0" max="100" value="100" style="flex-grow:1; accent-color:#ff7aa2;">
                    </div>
                </div>
            </div>
        </div>
    `;

    // ИСПРАВЛЕНО: Принудительный сброс на 0-ю секунду и автоматический Play при старте Разбора
    const audio = document.getElementById('audio');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        const playIcon = document.getElementById('play-icon');
        if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
    }

    // ИСПРАВЛЕНО: Кнопка Закрыть теперь полностью функциональна и сбрасывает ИИ-эффекты
    document.getElementById('close-splitter-btn').onclick = () => {
        isSplitterActiveNow = false; // Отключаем блокировку перескока треков
        if (typeof resetSplitterFilters === 'function') resetSplitterFilters();
        splitterLayer.style.display = 'none';
    };
    
    document.getElementById('start-split-process-btn').onclick = runSplitterNeuralSimulation;
    if (window.lucide) lucide.createIcons();
}

function runSplitterNeuralSimulation() {
    const startBtn = document.getElementById('start-split-process-btn');
    const progContainer = document.getElementById('splitter-progress-container');
    const progBar = document.getElementById('splitter-progress-bar');
    const statusText = document.getElementById('splitter-status-text');
    const mixerBlock = document.getElementById('splitter-mixer-block');

    if (!startBtn || !progContainer || !progBar || !statusText || !mixerBlock) return;

    if (typeof initSplitterAudioNodes === 'function') initSplitterAudioNodes();

    startBtn.style.display = 'none';
    progContainer.style.display = 'block';

    let currentPct = 0;
    const statuses = [
        "Анализ частотного спектра...",
        "Выделение вокальных формант...",
        "Изоляция 808-х басов и ударных...",
        "Устранение аудио-артефактов ИИ...",
        "Финальный рендеринг аудио-стемов..."
    ];

    let timer = setInterval(() => {
        currentPct += 4; // Сделали прогресс-бар чуть шустрее для удобства
        progBar.style.width = currentPct + '%';

        if (currentPct === 20) statusText.textContent = statuses[0];
        if (currentPct === 44) statusText.textContent = statuses[1];
        if (currentPct === 68) statusText.textContent = statuses[2];
        if (currentPct === 88) statusText.textContent = statuses[3];

        if (currentPct >= 100) {
            clearInterval(timer);
            progContainer.style.display = 'none';
            mixerBlock.style.display = 'flex';
            
            if (typeof bindLiveMixerSliders === 'function') bindLiveMixerSliders();
            
            // ИСПРАВЛЕНО: Кнопка "Скачать Стемы" теперь РЕАЛЬНО выкачивает MP3-файл в папку Загрузки/Проводник телефона
            document.getElementById('download-splitter-result-btn').onclick = () => {
                if (currentSplitterTrack && currentSplitterTrack.audio) {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = currentSplitterTrack.audio;
                    downloadLink.download = `VibeAI_${currentSplitterTrack.title}.mp3`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
            };
        }
    }, 40);
}

// Отдаем флаг активности наружу для перехвата автоплея
window.isSplitterActiveNow = () => isSplitterActiveNow;
