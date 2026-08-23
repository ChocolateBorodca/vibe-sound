// Функция вычисления схожести слов (расстояние Левенштейна) для ловли опечаток
function getWordsSimilarity(s1, s2) {
    let long = s1.toLowerCase().trim();
    let short = s2.toLowerCase().trim();
    if (long.length < short.length) { let tmp = long; long = short; short = tmp; }
    let longLength = long.length;
    if (longLength === 0) return 1.0;
    
    let costs = [];
    for (let i = 0; i <= long.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= short.length; j++) {
            if (i == 0) costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (long.charAt(i - 1) != short.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[short.length] = lastValue;
    }
    return (longLength - costs[short.length]) / longLength;
}

// Переопределяем логику подбора трека с защитой от опечаток
function playNextWaveTrack() {
    if (!isWaveActive || tracks.length === 0) return;

    const currentTrack = tracks[currentIndex];
    const currentGenre = (currentTrack && currentTrack.genre) ? currentTrack.genre.toLowerCase().trim() : '';

    // Ищем треки, у которых жанр совпадает минимум на 70% (ловит опечатки)
    let matchingTracks = tracks.filter(t => {
        if (!t.genre) return false;
        let sim = getWordsSimilarity(t.genre, currentGenre);
        return sim >= 0.7; 
    });

    if (matchingTracks.length > 1 && currentGenre !== '') {
        let pool = matchingTracks.filter(t => t.id !== currentTrack.id);
        const randomChoice = pool[Math.floor(Math.random() * pool.length)];
        currentIndex = tracks.findIndex(t => t.id === randomChoice.id);
    } else {
        let nextIdx = currentIndex;
        while (tracks.length > 1 && nextIdx === currentIndex) {
            nextIdx = Math.floor(Math.random() * tracks.length);
        }
        currentIndex = nextIdx;
    }

    if (typeof loadTrack === 'function') loadTrack();
    
    if (audio) {
        audio.play().catch(() => {});
        if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
        if (window.lucide) lucide.createIcons();
    }
}

// Создаем левую кнопку меню и новый экран на лету без изменения HTML
function injectWaveSidebarTab() {
    const sidebarMenu = document.querySelector('.sidebar .menu');
    const mainContent = document.querySelector('.main-content');
    
    if (!sidebarMenu || !mainContent || document.getElementById('menu-wave')) return;

    // 1. Прячем старую кнопку под обложкой, если она создается старым файлом
    const oldButton = document.getElementById('vibe-wave-toggle-btn');
    if (oldButton) oldButton.style.display = 'none';

    // 2. Создаем кнопку в левое меню
    const waveMenuItem = document.createElement('div');
    waveMenuItem.id = 'menu-wave';
    waveMenuItem.className = 'menu-item';
    waveMenuItem.innerHTML = `<i data-lucide="waves" style="color: #ff2a74;"></i><span>Моя Волна</span>`;
    
    // Вставляем строго после кнопки "Главная" (первый элемент меню)
    const mainMenuItem = document.getElementById('menu-main');
    if (mainMenuItem && mainMenuItem.nextSibling) {
        sidebarMenu.insertBefore(waveMenuItem, mainMenuItem.nextSibling);
    } else {
        sidebarMenu.appendChild(waveMenuItem);
    }

    // 3. Создаем контейнер под новый экран Волны
    const waveSection = document.createElement('section');
    waveSection.id = 'tab-wave';
    waveSection.className = 'tab-content';
    waveSection.style.cssText = 'display: none; padding: 20px 40px; height: calc(88vh - 160px);';
    waveSection.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 30px; position: relative;">
            <div style="font-size: 13px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; position: absolute; top: 0; left: 0;">Бесконечный поток</div>
            
            <!-- Анимированная фигура будет встроена сюда -->
            <div id="wave-animation-container" style="width: 200px; height: 200px; position: relative; display: flex; align-items: center; justify-content: center;"></div>
            
            <button id="wave-center-toggle-btn" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #ffffff; padding: 14px 40px; border-radius: 30px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.2); backdrop-filter: blur(10px);">
                🌊 Включить Мою Волну
            </button>
        </div>
    `;
    
    // Вставляем новый экран перед футером управления
    const controlsBar = document.querySelector('.player-controls-bar');
    mainContent.insertBefore(waveSection, controlsBar);

    // 4. Логика переключения вкладки
    waveMenuItem.addEventListener('click', () => {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        
        waveSection.classList.add('active');
        waveMenuItem.classList.add('active');
        
        document.getElementById('page-title').textContent = "Моя Волна";
    });

    // Обработчик для центральной кнопки запуска Волны
    const centerBtn = document.getElementById('wave-center-toggle-btn');
    if (centerBtn) {
        centerBtn.addEventListener('click', () => {
            if (typeof toggleMyVibeWave === 'function') {
                toggleMyVibeWave();
                
                // Синхронизируем текст на кнопке
                if (isWaveActive) {
                    centerBtn.style.background = '#ff2a74';
                    centerBtn.style.borderColor = '#ff2a74';
                    centerBtn.style.boxShadow = '0 0 25px rgba(255, 42, 116, 0.5)';
                    centerBtn.innerHTML = '🌊 Поток запущен';
                } else {
                    centerBtn.style.background = 'rgba(255, 255, 255, 0.05)';
                    centerBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    centerBtn.style.boxShadow = 'none';
                    centerBtn.innerHTML = '🌊 Включить Мою Волну';
                }
            }
        });
    }

    if (window.lucide) lucide.createIcons();
}

// Запускаем проверку каждую секунду, чтобы кнопка точно внедрилась
setInterval(injectWaveSidebarTab, 1000);
