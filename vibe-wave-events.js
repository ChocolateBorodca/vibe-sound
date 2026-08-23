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

setTimeout(() => {
    if (typeof switchTab === 'function') {
        const originalSwitchTab = switchTab;
        window.switchTab = function(tabName) {
            originalSwitchTab(tabName);
            
            if (tabName === 'wave') {
                const waveMenuBtn = document.getElementById('menu-wave');
                if (waveMenuBtn) waveMenuBtn.classList.add('active');
                const waveTabSection = document.getElementById('tab-wave');
                if (waveTabSection) waveTabSection.style.setProperty('display', 'flex', 'important');
                document.getElementById('page-title').textContent = "Моя Волна";
                if (typeof initVibeWaveMap === 'function') initVibeWaveMap();
            } else {
                const waveTabSection = document.getElementById('tab-wave');
                if (waveTabSection) waveTabSection.style.display = 'none';
                const waveMenuBtn = document.getElementById('menu-wave');
                if (waveMenuBtn) waveMenuBtn.classList.remove('active');
            }
        };
    }

    const waveMenuBtn = document.getElementById('menu-wave');
    if (waveMenuBtn) {
        waveMenuBtn.style.cursor = 'pointer';
        waveMenuBtn.addEventListener('click', () => {
            if (typeof switchTab === 'function') switchTab('wave');
        });
    }

    const audio = document.getElementById('audio');
    if (audio) {
        audio.addEventListener('ended', () => {
            if (typeof isWaveActive !== 'undefined' && isWaveActive) {
                handleWaveTrackEnded();
            }
        });
    }
}, 1500);
