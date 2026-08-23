// Проверяем, открыта ли вкладка "Моя Волна" для переключения фонов
setInterval(() => {
    const waveTabSection = document.getElementById('tab-wave');
    const mainContent = document.querySelector('.main-content');
    if (!waveTabSection || !mainContent) return;

    if (waveTabSection.classList.contains('active')) {
        mainContent.style.setProperty('background', '#000000', 'important');
        mainContent.style.setProperty('background-color', '#000000', 'important');
        waveTabSection.style.setProperty('background', '#000000', 'important');
        waveTabSection.style.setProperty('background-color', '#000000', 'important');
    } else {
        mainContent.style.removeProperty('background');
        mainContent.style.removeProperty('background-color');
        waveTabSection.style.removeProperty('background');
        waveTabSection.style.removeProperty('background-color');
    }
}, 300);

// Инициализация карты Моей Волны
function initVibeWaveMap() {
    const waveTabSection = document.getElementById('tab-wave');
    if (!waveTabSection) return;

    // Стираем старый пустой контейнер и перерисовываем карту с кнопками
    waveTabSection.innerHTML = '';
    waveTabSection.style.cssText = 'padding: 30px 40px; height: calc(88vh - 180px); display: flex; align-items: center; justify-content: center; position: relative; width: 100%;';

    // Создаем центральный контейнер-круг
    const mapWrapper = document.createElement('div');
    mapWrapper.style.cssText = 'position: relative; width: 450px; height: 450px; display: flex; align-items: center; justify-content: center;';

    // Считываем ВСЕ уникальные жанры, которые ты сам лично вписал для треков
    let uniqueGenres = [];
    tracks.forEach(track => {
        if (track.genre) {
            let cleanG = track.genre.trim();
            if (cleanG && !uniqueGenres.includes(cleanG)) {
                uniqueGenres.push(cleanG);
            }
        }
    });

    // Собираем массив системных смарт-кнопок
    let smartButtons = [];
    
    // Добавляем смарт-кнопку "Новинки", если в плеере есть хоть один трек
    if (tracks.length > 0) {
        smartButtons.push({ name: "✨ Новинки", type: "new" });
    }
    
    // Добавляем смарт-кнопку "Популярное", если есть история прослушиваний
    let playData = JSON.parse(localStorage.getItem('vibe_detailed_plays') || "{}");
    let hasPlays = Object.values(playData).some(v => v > 0);
    if (hasPlays) {
        smartButtons.push({ name: "🔥 Популярное", type: "popular" });
    }

    // Объединяем твои кастомные жанры со смарт-кнопками в одну орбиту вокруг центра
    let allNodes = [...smartButtons.map(b => ({ name: b.name, type: b.type, isSmart: true }))];
    uniqueGenres.forEach(g => allNodes.push({ name: g, isSmart: false }));

    // Если треков или жанров совсем нет, выводим красивую подсказку
    if (allNodes.length === 0) {
        waveTabSection.innerHTML = '<div style="color: rgba(255,255,255,0.4); font-size: 14px; text-align: center;">Загрузите треки во вкладке Любимое и укажите им жанры, чтобы запустить Мою Волну!</div>';
        return;
    }

    // Генерируем центральную большую кнопку "🌊 Моя Волна"
    const centerBtn = document.createElement('button');
    centerBtn.innerHTML = '🌊<br>Моя Волна';
    centerBtn.style.cssText = 'position: absolute; z-index: 50; width: 110px; height: 110px; background: #ff2a74; border: 2px solid #ff2a74; color: #ffffff; font-size: 14px; font-weight: 700; border-radius: 50%; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 30px rgba(255, 42, 116, 0.6); text-align: center; line-height: 1.3;';
    
    centerBtn.addEventListener('click', () => {
        // Клик по центру запускает случайный микс вообще из всех треков Медиатеки
        if (tracks.length === 0) return;
        currentIndex = Math.floor(Math.random() * tracks.length);
        startWavePlayback();
        alert("🌊 Поток запущен: Плеер миксует всю вашу медиатеку!");
    });
    mapWrapper.appendChild(centerBtn);

    // Математический расчет расположения кнопок по круговой орбите (Радиус 160px)
    const radius = 160;
    const totalNodes = allNodes.length;

    allNodes.forEach((node, index) => {
        const angle = (index * 2 * Math.PI) / totalNodes - (Math.PI / 2); // Равномерно распределяем углы
        const x = Math.cos(angle) * radius + 225 - 65; // 225 — центр вращения, 65 — половина ширины кнопки
        const y = Math.sin(angle) * radius + 225 - 20; // 20 — половина высоты кнопки

        const btn = document.createElement('button');
        btn.innerHTML = node.name;
        
        // Разные неоновые стили: смарт-кнопки подсвечиваем бирюзой, твои жанры — фиолетовым глянцем
        if (node.isSmart) {
            btn.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; width: 130px; height: 40px; background: rgba(0, 245, 255, 0.08); border: 1px solid rgba(0, 245, 255, 0.3); color: #00f5ff; font-size: 12px; font-weight: 600; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; z-index: 10; text-shadow: 0 0 8px rgba(0, 245, 255, 0.4); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05); backdrop-filter: blur(5px);`;
            btn.addEventListener('mouseover', () => { btn.style.background = 'rgba(0, 245, 255, 0.2)'; btn.style.boxShadow = '0 0 15px rgba(0, 245, 255, 0.4)'; });
            btn.addEventListener('mouseout', () => { btn.style.background = 'rgba(0, 245, 255, 0.08)'; btn.style.boxShadow = 'none'; });
        } else {
            btn.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; width: 130px; height: 40px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: #ffffff; font-size: 12px; font-weight: 500; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; z-index: 10; backdrop-filter: blur(5px);`;
            btn.addEventListener('mouseover', () => { btn.style.background = 'rgba(255, 255, 255, 0.1)'; btn.style.borderColor = '#ff2a74'; btn.style.color = '#ff2a74'; btn.style.boxShadow = '0 0 15px rgba(255, 42, 116, 0.3)'; });
            btn.addEventListener('mouseout', () => { btn.style.background = 'rgba(255, 255, 255, 0.03)'; btn.style.borderColor = 'rgba(255, 255, 255, 0.1)'; btn.style.color = '#ffffff'; btn.style.boxShadow = 'none'; });
        }

        // Настройка обработчиков клика по кнопкам вайба
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (node.isSmart) {
                if (node.type === "new") {
                    // Кнопка "✨ Новинки" включает самый последний загруженный трек с телефона
                    currentIndex = tracks.length - 1;
                    startWavePlayback();
                    alert("✨ Включен поток новинок!");
                } else if (node.type === "popular") {
                    // Кнопка "🔥 Популярное" находит песню с максимальным числом кликов на Play
                    let maxCount = -1;
                    let popularIdx = 0;
                    tracks.forEach((t, i) => {
                        let count = playData[t.id] || 0;
                        if (count > maxCount) { maxCount = count; popularIdx = i; }
                    });
                    currentIndex = popularIdx;
                    startWavePlayback();
                    alert("🔥 Включен поток вашего самого популярного трека!");
                }
            } else {
                // Клик по кнопке жанра находит все треки с этим тегом и включает один из них
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

// Запуск воспроизведения и загрузка трека на главной панели
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

// Отслеживаем переключение на вкладку Моя Волна, чтобы вовремя отрисовать карту кнопок
setTimeout(() => {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        if (item.textContent.includes('Моя Волна')) {
            item.addEventListener('click', () => {
                // Включаем вкладку в script.js стандартным методом
                if (typeof switchTab === 'function') switchTab('wave');
                const pageTitle = document.getElementById('page-title');
                if (pageTitle) pageTitle.textContent = "Моя Волна";
                
                // Генерируем нашу круговую карту вайбов
                initVibeWaveMap();
            });
        }
    });
}, 1200);
