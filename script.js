const tracks = [];
const wallpapers = [
    { id: "classic", name: "Классический", url: "none", isClassic: true }
];

let currentIndex = 0;
let currentWallpaperId = "classic";
let totalListens = parseInt(localStorage.getItem('vibe_total_plays') || "0", 10);

const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progress = document.getElementById('progress');
const volumeSlider = document.getElementById('volume');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const cover = document.getElementById('cover');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const bgWallpaper = document.getElementById('bg-wallpaper');
const bgGlowLayer = document.getElementById('bg-glow-layer');
const coverParent = document.getElementById('cover-parent');

function loadTrack() {
    if (tracks.length === 0) {
        title.textContent = "Нет треков";
        artist.textContent = "Загрузите музыку во вкладке Любимое";
        cover.style.display = "none";
        coverParent.style.background = "linear-gradient(135deg, #1e1b4b, #0f172a)";
        audio.src = "";
        return;
    }
    
    if (currentIndex >= tracks.length || currentIndex < 0) {
        currentIndex = 0;
    }

    const current = tracks[currentIndex];
    audio.src = current.audio;
    
    const trackGenreLabel = current.genre ? " [" + current.genre + "]" : "";
    title.textContent = current.title + trackGenreLabel;
    artist.textContent = current.artist;
    progress.value = 0;

    if (!current.cover || current.cover === "") {
        cover.style.display = "none";
        coverParent.style.background = "linear-gradient(135deg, #1e1b4b, #0f172a)";
    } else {
        cover.style.display = "block";
        cover.src = current.cover;
    }
}

function recordPlayEvent(trackId) {
    totalListens++;
    localStorage.setItem('vibe_total_plays', totalListens);

    let playData = JSON.parse(localStorage.getItem('vibe_detailed_plays') || "{}");
    playData[trackId] = (playData[trackId] || 0) + 1;
    localStorage.setItem('vibe_detailed_plays', JSON.stringify(playData));

    const currentHour = new Date().getHours();
    let hourlyData = JSON.parse(localStorage.getItem('vibe_hourly_plays') || "{}");
    hourlyData[currentHour] = (hourlyData[currentHour] || 0) + 1;
    localStorage.setItem('vibe_hourly_plays', JSON.stringify(hourlyData));
}

function togglePlay() {
    if (tracks.length === 0) return;
    
    const targetVolume = volumeSlider ? parseFloat(volumeSlider.value) / 100 : 1;

    if (audio.paused) {
        if (localStorage.getItem('set-fade') === 'true') {
            audio.volume = 0;
            audio.play().catch(function() {});
            let volInterval = setInterval(function() {
                if (audio.volume < targetVolume - 0.05) {
                    audio.volume += 0.05;
                } else { 
                    audio.volume = targetVolume; 
                    clearInterval(volInterval); 
                }
            }, 50);
        } else {
            audio.volume = targetVolume;
            audio.play().catch(function() {});
        }
        
        playIcon.setAttribute('data-lucide', 'pause');
        if (tracks[currentIndex]) recordPlayEvent(tracks[currentIndex].id);
    } else {
        audio.pause();
        playIcon.setAttribute('data-lucide', 'play');
    }
    if (window.lucide) lucide.createIcons();
}

function nextTrack() {
    if (tracks.length === 0) return;
    
    if (typeof isWaveActive !== 'undefined' && isWaveActive) {
        if (typeof handleWaveTrackEnded === 'function') handleWaveTrackEnded();
        return;
    }

    currentIndex = (currentIndex + 1) % tracks.length;
    loadTrack();
    audio.play().catch(function() {});
    playIcon.setAttribute('data-lucide', 'pause');
    if (window.lucide) lucide.createIcons();
    recordPlayEvent(tracks[currentIndex].id);
}

function prevTrack() {
    if (tracks.length === 0) return;
    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    loadTrack();
    audio.play().catch(function() {});
    playIcon.setAttribute('data-lucide', 'pause');
    if (window.lucide) lucide.createIcons();
    recordPlayEvent(tracks[currentIndex].id);
}

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return min + ':' + (sec < 10 ? '0' : '') + sec;
}

audio.addEventListener('timeupdate', function() {
    if (audio.duration) {
        progress.value = (audio.currentTime / audio.duration) * 100;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
});

audio.addEventListener('loadedmetadata', function() {
    durationEl.textContent = formatTime(audio.duration);
});

progress.addEventListener('input', function() {
    if (audio.duration) {
        audio.currentTime = (progress.value / 100) * audio.duration;
    }
});

if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
        audio.volume = parseFloat(volumeSlider.value) / 100;
    });
}

// ЦЕНТРАЛИЗОВАННЫЙ ДИСПЕТЧЕР ОКОНЧАНИЯ ПЕСНИ (Решает проблему конфликтов)
audio.addEventListener('ended', function() {
    if (tracks.length === 0) return;
    
    if (localStorage.getItem('set-loop') === 'true') {
        audio.currentTime = 0;
        audio.play().catch(function() {});
        return;
    }

    // 1. Приоритет режиму «Моя Волна»
    if (typeof isWaveActive !== 'undefined' && isWaveActive) {
        if (typeof handleWaveTrackEnded === 'function') handleWaveTrackEnded();
        return;
    }

    // 2. Второй приоритет — активный плейлист
    if (typeof currentPlaylistTracksPool !== 'undefined' && currentPlaylistTracksPool.length > 0) {
        if (typeof playNextTrackInPlaylist === 'function') playNextTrackInPlaylist();
        return;
    }

    // 3. Дефолтный режим медиатеки
    nextTrack();
});

function setWallpaper(wpId) {
    currentWallpaperId = wpId;
    const wp = wallpapers.find(function(w) { return w.id === wpId; });
    if (wp) {
        if (wp.isClassic) {
            bgWallpaper.style.backgroundImage = "none";
            const isGlowOn = localStorage.getItem('set-glow') !== 'false';
            bgGlowLayer.style.display = isGlowOn ? "block" : "none";
        } else {
            bgWallpaper.style.backgroundImage = "url('" + wp.url + "')";
            bgGlowLayer.style.display = "none";
        }
        if (typeof saveSettingToDB === "function") saveSettingToDB("currentWallpaper", wpId);
    }
    document.querySelectorAll('.wallpaper-card-item').forEach(function(card, i) {
        if(wallpapers[i]) card.classList.toggle('active', wallpapers[i].id === wpId);
    });
}

if (localStorage.getItem('set-glow') === 'false') {
    if (bgGlowLayer) bgGlowLayer.style.display = 'none';
}

// МОБИЛЬНЫЙ ХУК ДЛЯ ВЫЕЗЖАЮЩЕГО САЙДБАРА
document.addEventListener('DOMContentLoaded', () => {
    const brandBlock = document.querySelector('.sidebar .brand');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    if (brandBlock && sidebar) {
        brandBlock.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.stopPropagation();
                sidebar.classList.toggle('mobile-open');
            }
        });
    }

    if (mainContent && sidebar) {
        mainContent.addEventListener('click', () => {
            if (sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }
});
