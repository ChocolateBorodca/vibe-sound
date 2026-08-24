function handleWaveTrackEnded() {
    if (!isWaveActive || typeof tracks === 'undefined' || tracks.length === 0) return;

    if (activeWaveGenre === "mix" || activeWaveGenre === "new" || activeWaveGenre === "popular") {
        currentIndex = Math.floor(Math.random() * tracks.length);
        startWavePlayback();
        return;
    }

    let currentGenrePool = tracks.filter(t => t.genre && t.genre.toLowerCase().trim() === activeWaveGenre);
    
    if (currentGenrePool.length > 0) {
        const randomTrack = currentGenrePool[Math.floor(Math.random() * currentGenrePool.length)];
        currentIndex = tracks.findIndex(t => t.id === randomTrack.id);
        startWavePlayback();
    } else {
        let allGenres = [];
        tracks.forEach(t => {
            if (t.genre) {
                let g = t.genre.toLowerCase().trim();
                if (g && !allGenres.includes(g)) allGenres.push(g);
            }
        });

        let alternativeGenres = allGenres.filter(g => g !== activeWaveGenre);

        if (alternativeGenres.length > 0) {
            let nextGenre = alternativeGenres[Math.floor(Math.random() * alternativeGenres.length)];
            activeWaveGenre = nextGenre;
            
            let nextPool = tracks.filter(t => t.genre && t.genre.toLowerCase().trim() === nextGenre);
            const randomTrack = nextPool[Math.floor(Math.random() * nextPool.length)];
            currentIndex = tracks.findIndex(t => t.id === randomTrack.id);
            
            startWavePlayback();
            
            const waveTabSection = document.getElementById('tab-wave');
            if (waveTabSection && waveTabSection.classList.contains('active')) {
                if (typeof initVibeWaveMap === 'function') initVibeWaveMap();
            }
        } else {
            currentIndex = Math.floor(Math.random() * tracks.length);
            startWavePlayback();
        }
    }
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

// СВЕРХНАДЕЖНЫЙ СИСТЕМНЫЙ ПЕРЕКЛЮЧАТЕЛЬ АБСОЛЮТНО ВСЕХ ВКЛАДОК ПЛЕЕРА
setTimeout(() => {
    window.switchTab = function(tabName) {
        // Прячем вообще все экраны плеера
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
            tab.classList.remove('active');
        });
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

        const targetTab = document.getElementById(`tab-${tabName}`);
        const targetMenu = document.getElementById(`menu-${tabName}`);

        if (targetTab) {
            if (tabName === 'wave' || tabName === 'playlists' || tabName === 'settings' || tabName === 'stats') {
                targetTab.style.setProperty('display', 'flex', 'important');
            } else {
                targetTab.style.display = 'block';
            }
            targetTab.classList.add('active');
        }

        if (targetMenu) targetMenu.classList.add('active');

        // Управляем заголовками и мгновенно вызываем отрисовку нужного нам файла
        let titleText = "Главная";
        if (tabName === 'favorites') titleText = "Медиатека";
        if (tabName === 'wallpaper') titleText = "Обои";
        
        if (tabName === 'wave') { 
            titleText = "Моя Волна"; 
            if (typeof initVibeWaveMap === 'function') initVibeWaveMap(); 
        }
        if (tabName === 'playlists') { 
            titleText = "Плейлисты"; 
            currentOpenPlaylistIdx = null; 
            if (typeof renderPlaylistsUI === 'function') renderPlaylistsUI(); 
        }
        if (tabName === 'settings') { 
            titleText = "Настройки"; 
            if (typeof renderSettingsUI === 'function') renderSettingsUI(); 
        }
        if (tabName === 'stats') { 
            titleText = "Статистика"; 
            if (typeof buildAdvancedStatsUI === 'function') buildAdvancedStatsUI(); 
        }

        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = titleText;
    };

    // Биндим чистые клики на боковое меню плеера
    document.getElementById('menu-main').addEventListener('click', () => switchTab('main'));
    document.getElementById('menu-favorites').addEventListener('click', () => switchTab('favorites'));
    document.getElementById('menu-wallpaper').addEventListener('click', () => switchTab('wallpaper'));
    document.getElementById('menu-wave').addEventListener('click', () => switchTab('wave'));
    document.getElementById('menu-playlists').addEventListener('click', () => switchTab('playlists'));
    document.getElementById('menu-stats').addEventListener('click', () => switchTab('stats'));
    document.getElementById('menu-settings').addEventListener('click', () => switchTab('settings'));

    // Привязываем окончание аудиопотока
    const audio = document.getElementById('audio');
    if (audio) {
        audio.addEventListener('ended', () => {
            if (typeof isWaveActive !== 'undefined' && isWaveActive) {
                handleWaveTrackEnded();
            }
        });
    }
}, 1000);
