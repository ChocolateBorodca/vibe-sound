// Перехватываем стандартное окно выбора песни, чтобы спросить жанр
setTimeout(() => {
    const audioInput = document.getElementById('local-audio-input');
    if (!audioInput) return;

    // Подменяем стандартное событие на наше умное
    const oldChange = audioInput.onchange || audioInput.addEventListener;
    
    audioInput.addEventListener('change', function(e) {
        if (!e.target.files || e.target.files.length === 0) return;
        
        // Запрашиваем жанр/вайб у пользователя
        const genre = prompt("Какой жанр или вайб у этого трека? (например: рэп, грустно, чил, фонк):", "рэп") || "рэп";
        
        // Передаем жанр в массив последней загруженной песни
        setTimeout(() => {
            if (tracks.length > 0) {
                tracks[tracks.length - 1].genre = genre.toLowerCase().trim();
                // Перезаписываем в базу данных телефона
                if (typeof updateTrackInDB === 'function') {
                    updateTrackInDB(tracks[tracks.length - 1]);
                }
                if (typeof buildFavoritesUI === 'function') buildFavoritesUI();
                if (typeof loadTrack === 'function') loadTrack();
            }
        }, 800);
    });
}, 1500);

// Логика бесконечной работы "Моей Волны" по жанрам
let isWaveActive = false;

function toggleMyVibeWave() {
    if (tracks.length === 0) {
        alert("В Медиатеке нет треков для запуска Моей Волны!");
        return;
    }

    isWaveActive = !isWaveActive;
    const waveBtn = document.getElementById('vibe-wave-toggle-btn');
    
    if (isWaveActive) {
        if (waveBtn) {
            waveBtn.style.background = '#ff2a74';
            waveBtn.style.boxShadow = '0 0 15px rgba(255, 42, 116, 0.6)';
            waveBtn.innerHTML = '🌊 Моя Волна: ВКЛ';
        }
        playNextWaveTrack();
    } else {
        if (waveBtn) {
            waveBtn.style.background = 'rgba(255, 255, 255, 0.05)';
            waveBtn.style.boxShadow = 'none';
            waveBtn.innerHTML = '🌊 Включить Мою Волну';
        }
    }
}

function playNextWaveTrack() {
    if (!isWaveActive || tracks.length === 0) return;

    const currentTrack = tracks[currentIndex];
    const currentGenre = (currentTrack && currentTrack.genre) ? currentTrack.genre : '';

    // Ищем треки с таким же вайбом
    let matchingTracks = tracks.filter(t => t.genre === currentGenre);

    if (matchingTracks.length > 1 && currentGenre !== '') {
        let pool = matchingTracks.filter(t => t.id !== currentTrack.id);
        const randomChoice = pool[Math.floor(Math.random() * pool.length)];
        currentIndex = tracks.findIndex(t => t.id === randomChoice.id);
    } else {
        // Если похожих нет — включается случайное "Открытие"
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

// Автоматически переключаем Волну, когда трек закончился
setTimeout(() => {
    if (audio) {
        audio.addEventListener('ended', () => {
            if (isWaveActive) playNextWaveTrack();
        });
    }
}, 1500);

// Встраиваем красивую кнопку на главный экран
function injectWaveButton() {
    const playerCard = document.querySelector('.player-card');
    if (!playerCard || document.getElementById('vibe-wave-toggle-btn')) return;

    const waveBtn = document.createElement('button');
    waveBtn.id = 'vibe-wave-toggle-btn';
    waveBtn.innerHTML = '🌊 Включить Мою Волну';
    waveBtn.style.cssText = `
        margin-top: 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
        color: #ffffff; padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 600;
        cursor: pointer; transition: all 0.3s ease; width: 100%; max-width: 280px; text-align: center;
    `;
    waveBtn.addEventListener('click', toggleMyVibeWave);
    playerCard.appendChild(waveBtn);
}
setInterval(injectWaveButton, 1000);
