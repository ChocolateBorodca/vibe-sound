let isWaveActive = false;

// Инициализация карты Моей Волны и орбиты кнопок
function initVibeWaveMap() {
    const waveTabSection = document.getElementById('tab-wave');
    if (!waveTabSection) return;

    waveTabSection.innerHTML = '';
    // ИСПРАВЛЕНО: Убрали принудительный черный цвет, вернули родное стекло и центрирование
    waveTabSection.style.cssText = 'padding: 30px 40px; height: calc(88vh - 180px); display: flex; align-items: center; justify-content: center; position: relative; width: 100%;';

    // Создаем контейнер-основу для круга
    const mapWrapper = document.createElement('div');
    mapWrapper.style.cssText = 'position: relative; width: 450px; height: 450px; display: flex; align-items: center; justify-content: center;';

    // Собираем все уникальные жанры, вписанные пользователем вручную
    let uniqueGenres = [];
    if (typeof tracks !== 'undefined') {
        tracks.forEach(track => {
            if (track.genre) {
                let cleanG = track.genre.trim();
                if (cleanG && !uniqueGenres.includes(cleanG)) {
                    uniqueGenres.push(cleanG);
                }
            }
        });
    }

    // Собираем массив кнопок для вывода на орбиту
    let smartButtons = [];
    if (typeof tracks !== 'undefined' && tracks.length > 0) {
        smartButtons.push({ name: "✨ Новинки", type: "new" });
    }
    
    let playData = JSON.parse(localStorage.getItem('vibe_detailed_plays') || "{}");
    let hasPlays = Object.values(playData).some(v => v > 0);
    if (hasPlays) {
        smartButtons.push({ name: "🔥 Популярное", type: "popular" });
    }

    let allNodes = [...smartButtons.map(b => ({ name: b.name, type: b.type, isSmart: true }))];
    uniqueGenres.forEach(g => allNodes.push({ name: g, isSmart: false }));

    if (allNodes.length === 0) {
        waveTabSection.innerHTML = '<div style="color: rgba(255,255,255,0.4); font-size: 14px; text-align: center; backdrop-filter: blur(10px); padding: 20px; border-radius: 16px; background: rgba(255,255,255,0.02);">Загрузите треки во вкладке Любимое и укажите им жанры, чтобы запустить Мою Волну!</div>';
        return;
    }

    // Центральная большая кнопка
    const centerBtn = document.createElement('button');
    centerBtn.innerHTML = '🌊<br>Моя Волна';
    centerBtn.style.cssText = 'position: absolute; z-index: 50; width: 110px; height: 110px; background: #ff2a74; border: 2px solid #ff2a74; color: #ffffff; font-size: 14px; font-weight: 700; border-radius: 50%; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 30px rgba(255, 42, 116, 0.6); text-align: center; line-height: 1.3;';
    
    centerBtn.addEventListener('click', () => {
        if (typeof tracks === 'undefined' || tracks.length === 0) return;
        currentIndex = Math.floor(Math.random() * tracks.length);
        startWavePlayback();
        alert("🌊 Поток запущен: Плеер миксует всю вашу медиатеку!");
    });
    mapWrapper.appendChild(centerBtn);

    // Математический расчет кругового распределения (Радиус 160px)
    const radius = 160;
    const totalNodes = allNodes.length;

    allNodes.forEach((node, index) => {
        const angle = (index * 2 * Math.PI) / totalNodes - (Math.PI / 2);
        const x = Math.cos(angle) * radius + 225 - 65; // 225 - центр холста
        const y = Math.sin(angle) * radius + 225 - 20;

        const btn = document.createElement('button');
        btn.innerHTML = node.name;
        
        if (node.isSmart) {
            btn.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; width: 130px; height: 40px; background: rgba(0, 245, 255, 0.12); border: 1px solid rgba(0, 245, 255, 0.4); color: #00f5ff; font-size: 12px; font-weight: 600; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; z-index: 10; text-shadow: 0 0 8px rgba(0, 245, 255, 0.4); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);`;
            btn.addEventListener('mouseover', () => { btn.style.background = 'rgba(0, 245, 255, 0.25)'; btn.style.boxShadow = '0 0 15px rgba(0, 245, 255, 0.5)'; });
            btn.addEventListener('mouseout', () => { btn.style.background = 'rgba(0, 245, 255, 0.12)'; btn.style.boxShadow = 'none'; });
        } else {
            btn.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; width: 130px; height: 40px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; font-size: 12px; font-weight: 500; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; z-index: 10; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);`;
            btn.addEventListener('mouseover', () => { btn.style.background = 'rgba(255, 255, 255, 0.12)'; btn.style.borderColor = '#ff2a74'; btn.style.color = '#ff2a74'; btn.style.boxShadow = '0 0 15px rgba(255, 42, 116, 0.4)'; });
            btn.addEventListener('mouseout', () => { btn.style.background = 'rgba(255, 255, 255, 0.04)'; btn.style.borderColor = 'rgba(255, 255, 255, 0.15)'; btn.style.color = '#ffffff'; btn.style.boxShadow = 'none'; });
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof tracks === 'undefined' || tracks.length === 0) return;
            
            if (node.isSmart) {
                if (node.type === "new") {
                    currentIndex = tracks.length - 1;
                    startWavePlayback();
                    alert("✨ Включен поток новинок!");
                } else if (node.type === "popular") {
                    let maxCount = -1;
                    let popularIdx = 0;
                    tracks.forEach((t, i) => {
                        let count = playData[t.id] || 0;
                        if (count > maxCount) { maxCount = count; popularIdx = i; }
                    });
                    currentIndex = popularIdx;
                    startWavePlayback();
                    alert("🔥 Включен поток популярной музыки!");
                }
            } else {
                let genrePool = tracks.filter(t => t.genre && t.genre.toLowerCase().trim() === node.name.toLowerCase().trim());
                if (genrePool.length > 0) {
                    const randomTrack = genrePool[Math.floor(Math.random() * genrePool.length)];
                    currentIndex = tracks.findIndex(t => t.id === randomTrack.id);
                    startWavePlayback();
                    alert(`🌊 Запущен поток жанра: ${node.name}`);
                }
            }
        });

        mapWrapper.appendChild(btn);
    });

    waveTabSection.appendChild(mapWrapper);
}

function startWavePlayback() {
    if (typeof loadTrack === 'function') loadTrack();
    const audio = document.getElementById('audio');
    const playIcon = document.getElementById('play-icon');
    if (audio) {
        audio.play().catch(() => {});
        if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
        if (window.lucide) lucide.createIcons();
    }
}

// Принудительное связывание событий клика левого меню без ломающих интервалов
setTimeout(() => {
    const waveMenuBtn = document.getElementById('menu-wave');
    if (!waveMenuBtn) return;

    waveMenuBtn.addEventListener('click', () => {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
            tab.classList.remove('active');
        });
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

        const waveTab = document.getElementById('tab-wave');
        if (waveTab) {
            waveTab.style.setProperty('display', 'flex', 'important');
            waveTab.classList.add('active');
        }
        
        waveMenuBtn.classList.add('active');
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = "Моя Волна";
        
        initVibeWaveMap();
    });

    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.id !== 'menu-wave') {
            item.addEventListener('click', () => {
                const waveTab = document.getElementById('tab-wave');
                if (waveTab) {
                    waveTab.style.display = 'none';
                    waveTab.classList.remove('active');
                }
            });
        }
    });
}, 1200);
