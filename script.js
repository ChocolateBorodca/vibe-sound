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
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const cover = document.getElementById('cover');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const bgWallpaper = document.getElementById('bg-wallpaper');
const bgGlowLayer = document.getElementById('bg-glow-layer');
const coverParent = document.getElementById('cover-parent');

if (!document.getElementById('stats-custom-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'stats-custom-styles';
    styleElement.textContent = `
        .stats-chart-scroll-area {
            display: flex !important;
            gap: 24px !important;
            padding: 10px 10px 20px 10px !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            scrollbar-width: thin !important;
            scrollbar-color: rgba(255, 42, 116, 0.3) transparent !important;
            -webkit-overflow-scrolling: touch !important;
            cursor: grab !important;
        }
        .stats-chart-scroll-area:active { cursor: grabbing !important; }
        .stats-chart-scroll-area::-webkit-scrollbar { height: 4px !important; }
        .stats-chart-scroll-area::-webkit-scrollbar-thumb { background-color: rgba(255, 42, 116, 0.3) !important; border-radius: 4px !important; }
    `;
    document.head.appendChild(styleElement);
}

function loadTrack() {
    if (tracks.length === 0) {
        title.textContent = "Нет треков";
        artist.textContent = "Загрузите музыку во вкладке Любимое";
        cover.style.display = "none";
        coverParent.style.background = "linear-gradient(135deg, #1e1b4b, #0f172a)";
        audio.src = "";
        return;
    }
    const current = tracks[currentIndex];
    
    const shouldHideNoCover = localStorage.getItem('set-hide') === 'true';
    if (shouldHideNoCover && (!current.cover || current.cover === "")) {
        setTimeout(nextTrack, 100);
        return;
    }

    audio.src = current.audio;
    
    const trackGenreLabel = current.genre ? ` [${current.genre}]` : '';
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

    document.querySelectorAll('.track-row').forEach((row, i) => {
        row.classList.toggle('playing-now', i === currentIndex);
    });
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
    if (audio.paused) {
        if (localStorage.getItem('set-fade') === 'true') {
            audio.volume = 0;
            audio.play();
            let volInterval = setInterval(() => {
                if (audio.volume < 0.9) audio.volume += 0.1;
                else { audio.volume = 1; clearInterval(volInterval); }
            }, 100);
        } else {
            audio.volume = 1;
            audio.play();
        }
        
        playIcon.setAttribute('data-lucide', 'pause');
        if (tracks[currentIndex]) recordPlayEvent(tracks[currentIndex].id);
    } else {
        audio.pause();
        playIcon.setAttribute('data-lucide', 'play');
    }
    lucide.createIcons();
}

function nextTrack() {
    if (tracks.length === 0) return;
    
    if (typeof isWaveActive !== 'undefined' && isWaveActive) {
        if (typeof playNextWaveTrack === 'function') playNextWaveTrack();
        return;
    }

    currentIndex = (currentIndex + 1) % tracks.length;
    loadTrack();
    audio.play();
    playIcon.setAttribute('data-lucide', 'pause');
    lucide.createIcons();
    recordPlayEvent(tracks[currentIndex].id);
}

function prevTrack() {
    if (tracks.length === 0) return;
    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    loadTrack();
    audio.play();
    playIcon.setAttribute('data-lucide', 'pause');
    lucide.createIcons();
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

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        progress.value = (audio.currentTime / audio.duration) * 100;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
});

audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

progress.addEventListener('input', () => {
    if (audio.duration) {
        audio.currentTime = (progress.value / 100) * audio.duration;
    }
});

audio.addEventListener('ended', () => {
    if (tracks.length === 0) return;
    
    if (localStorage.getItem('set-loop') === 'true') {
        audio.currentTime = 0;
        audio.play();
        return;
    }

    if (typeof isWaveActive !== 'undefined' && isWaveActive) {
        if (typeof handleWaveTrackEnded === 'function') handleWaveTrackEnded();
    } else {
        nextTrack();
    }
});

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.style.display = 'block';
        targetTab.classList.add('active');
    }
    
    document.querySelectorAll('.menu-item').forEach(item => {
        if (tabName === 'main' && item.textContent.includes('Главная')) item.classList.add('active');
        if (tabName === 'favorites' && item.textContent.includes('Любимое')) item.classList.add('active');
        if (tabName === 'wallpaper' && item.textContent.includes('Обои')) item.classList.add('active');
    });

    let titleText = "Главная";
    if (tabName === 'favorites') titleText = "Медиатека";
    if (tabName === 'wallpaper') titleText = "Обои";
    
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = titleText;
}

document.getElementById('menu-main').addEventListener('click', () => switchTab('main'));
document.getElementById('menu-favorites').addEventListener('click', () => switchTab('favorites'));
document.getElementById('menu-wallpaper').addEventListener('click', () => switchTab('wallpaper'));

function setWallpaper(wpId) {
    currentWallpaperId = wpId;
    const wp = wallpapers.find(w => w.id === wpId);
    if (wp) {
        if (wp.isClassic) {
            bgWallpaper.style.backgroundImage = "none";
            const isGlowOn = localStorage.getItem('set-glow') !== 'false';
            bgGlowLayer.style.display = isGlowOn ? "block" : "none";
        } else {
            bgWallpaper.style.backgroundImage = `url('${wp.url}')`;
            bgGlowLayer.style.display = "none";
        }
        if (typeof saveSettingToDB === "function") saveSettingToDB("currentWallpaper", wpId);
    }
    document.querySelectorAll('.wallpaper-card-item').forEach((card, i) => {
        card.classList.toggle('active', wallpapers[i].id === wpId);
    });
}

if (localStorage.getItem('set-glow') === 'false') {
    if (bgGlowLayer) bgGlowLayer.style.display = 'none';
}
