let currentSplitterTrack = null;

function renderSplitterScreen(trackObj) {
    currentSplitterTrack = trackObj;
    
    // Находим или создаем полноэкранный контейнер для сплиттера поверх всего плеера
    let splitterLayer = document.getElementById('vibe-splitter-screen');
    if (!splitterLayer) {
        splitterLayer = document.createElement('div');
        splitterLayer.id = 'vibe-splitter-screen';
        document.body.appendChild(splitterLayer);
    }

    // Стилизуем под премиальное размытое стекло Liquid Glass во весь экран плеера
    splitterLayer.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:94vw; height:88vh; max-width:1200px; background:rgba(10,10,15,0.85); backdrop-filter:blur(40px); -webkit-backdrop-filter:blur(40px); border-radius:32px; border:1px solid rgba(255,255,255,0.12); z-index:999999; display:flex; flex-direction:column; padding:40px; color:#fff; box-shadow:0 40px 100px rgba(0,0,0,0.8);";

    splitterLayer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; width:100%;">
            <div>
                <h1 style="font-size:26px; font-weight:600; margin-bottom:4px; color:#fff;">Сплиттер трека</h1>
                <p style="font-size:14px; color:rgba(255,255,255,0.5); font-weight:500;">Разделение аудио на ИИ-дорожки</p>
            </div>
            <button class="upload-action-btn" id="close-splitter-btn" style="padding:10px 20px; font-size:14px;"><i data-lucide="x"></i> Закрыть сплиттер</button>
        </div>

        <div style="flex-grow:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:24px; width:100%;">
            <!-- Информационная плашка с выбранным треком -->
            <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:20px 40px; border-radius:20px; text-align:center; max-width:500px; width:100%;">
                <div style="font-size:11px; color:#ff2a74; text-transform:uppercase; letter-spacing:1.5px; font-weight:600; margin-bottom:6px;">Выбранный аудиопоток</div>
                <div style="font-size:18px; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" id="splitter-track-title">${trackObj.title}</div>
                <div style="font-size:13px; color:rgba(255,255,255,0.4); margin-top:2px;">${trackObj.artist}</div>
            </div>

            <!-- ИИ Стенд обработки (Логика симуляции разделения) -->
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

            <!-- Студийный ИИ-Микшер (появляется после обработки) -->
            <div id="splitter-mixer-block" style="display:none; width:100%; max-width:600px; background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.04); padding:24px; border-radius:24px; flex-direction:column; gap:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center;"><div style="font-size:11px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.5px;">🎛️ ИИ-Микшер стема</div><button class="upload-action-btn" style="padding:4px 12px; font-size:11px;" onclick="alert('Стемы успешно экспортированы в WAV стем-пакет!')">📥 Скачать Стемы</button></div>
                
                <!-- 4 Профессиональных ИИ ползунка -->
                <div style="display:flex; flex-direction:column; gap:16px; width:100%;">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span style="font-size:13px; width:80px; color:rgba(255,255,255,0.6);">🎤 Вокал</span>
                        <input type="range" min="0" max="100" value="90" style="flex-grow:1; accent-color:#ff2a74;">
                    </div>
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span style="font-size:13px; width:80px; color:rgba(255,255,255,0.6);">🎸 Мелодия</span>
                        <input type="range" min="0" max="100" value="85" style="flex-grow:1; accent-color:#8a2be2;">
                    </div>
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span style="font-size:13px; width:80px; color:rgba(255,255,255,0.6);">🥁 Ударные</span>
                        <input type="range" min="0" max="100" value="80" style="flex-grow:1; accent-color:#00f5ff;">
                    </div>
                    <div style="display:flex; align-items:center; gap:16px;">
                        <span style="font-size:13px; width:80px; color:rgba(255,255,255,0.6);">🔊 Басы (808)</span>
                        <input type="range" min="0" max="100" value="95" style="flex-grow:1; accent-color:#ff7aa2;">
                    </div>
                </div>
            </div>
        </div>
    `;

    // Привязываем события закрытия и симуляции прогресса обработки
    document.getElementById('close-splitter-btn').onclick = () => splitterLayer.style.display = 'none';
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
        currentPct += 2;
        progBar.style.width = currentPct + '%';

        // Меняем статус-текст по ходу заполнения шкалы
        if (currentPct === 20) statusText.textContent = statuses[1];
        if (currentPct === 45) statusText.textContent = statuses[2];
        if (currentPct === 70) statusText.textContent = statuses[3];
        if (currentPct === 90) statusText.textContent = statuses[4];

        if (currentPct >= 100) {
            clearInterval(timer);
            progContainer.style.display = 'none';
            mixerBlock.style.display = 'flex';
        }
    }, 60); // Скорость симуляции разделения
}
