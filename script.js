// === ВАШ МЕДИАПЛЕЕР С ФАЙЛАМИ ===
const tracks = [
    {
        title: "Night , Blooming Jasmine",
        artist: "fakemink",
        audio: "https://hlx6folrupjwnm6y.public.blob.vercel-storage.com/fakemink%20-%20Night%2C%20Blooming%20Jasmine.mp3",
        cover: "https://hlx6folrupjwnm6y.public.blob.vercel-storage.com/images%20%282%29.jpg"
    }
];

// === СПИСОК ОБОЕВ (GIF И КЛАССИКА) ===
const wallpapers = [
    {
        id: "classic",
        name: "Классический",
        url: "none", // Без GIF (просто черный с неоновым свечением)
        isClassic: true
    },
    {
        id: "requiem", // ИСПРАВЛЕНО: Теперь синтаксис полностью чистый
        name: "Requiem for a Dream",
        url: "https://vercel-storage.com"
    },
    {
        id: "Register",
        name: "Register",
        url: "https://hlx6folrupjwnm6y.public.blob.vercel-storage.com/Register%20-%20Login.gif"
    }
];

let currentIndex = 0;
let currentWallpaperId = "classic";

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
const favoritesList = document.getElementById('favorites-list');
const wallpaperGrid = document.getElementById('wallpaper-grid');
const bgWallpaper = document.getElementById('bg-wallpaper');
const bgGlowLayer = document.getElementById('bg-glow-layer');

function loadTrack() {
    const current = tracks[currentIndex];
    audio.src = current.audio;
    cover.src = current.cover;
    title.textContent = current.title;
    artist.textContent = current.artist;
    progress.value = 0;

    document.querySelectorAll('.track-row').forEach((row, i) => {
        row.classList.toggle('playing-now', i === currentIndex);
    });
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        playIcon.setAttribute('data-lucide', 'pause');
    } else {
        audio.pause();
        playIcon.setAttribute('data-lucide', 'play');
    }
    lucide.createIcons();
}

function nextTrack() {
    currentIndex = (currentIndex + 1) % tracks.length;
    loadTrack();
    audio.play();
    playIcon.setAttribute('data-lucide', 'pause');
    lucide.createIcons();
}

function prevTrack() {
    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    loadTrack();
    audio.play();
    playIcon.setAttribute('data-lucide', 'pause');
    lucide.createIcons();
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

audio.addEventListener('ended', nextTrack);

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.getElementById(`menu-${tabName}`).classList.add('active');

    document.getElementById('page-title').textContent = 
        tabName === 'main' ? 'Главная' : (tabName === 'favorites' ? 'Любимое' : 'Обои');
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
            bgGlowLayer.style.display = "block";
        } else {
            bgWallpaper.style.backgroundImage = `url('${wp.url}')`;
            bgGlowLayer.style.display = "none";
        }
    }

    document.querySelectorAll('.wallpaper-card-item').forEach((card, i) => {
        card.classList.toggle('active', wallpapers[i].id === wpId);
    });
}

function buildWallpaperUI() {
    wallpaperGrid.innerHTML = '';
    wallpapers.forEach((wp) => {
        const card = document.createElement('div');
        card.className = `wallpaper-card-item ${wp.id === currentWallpaperId ? 'active' : ''}`;
        
        const bgStyle = wp.isClassic ? 'background: #0d0d11;' : `background-image: url('${wp.url}');`;
        
        card.innerHTML = `
            <div class="wallpaper-preview" style="${bgStyle}"></div>
            <span>${wp.name}</span>
        `;
        
        card.addEventListener('click', () => setWallpaper(wp.id));
        wallpaperGrid.appendChild(card);
    });
}

function buildFavoritesUI() {
    favoritesList.innerHTML = '';
    tracks.forEach((track, i) => {
        const row = document.createElement('div');
        row.className = `track-row ${i === currentIndex ? 'playing-now' : ''}`;
        row.innerHTML = `
            <img src="${track.cover}" alt="">
            <div class="track-row-info">
                <div class="track-row-title">${track.title}</div>
                <div class="track-row-artist">${track.artist}</div>
            </div>
        `;
        row.addEventListener('click', () => {
            currentIndex = i;
            loadTrack();
            audio.play();
            playIcon.setAttribute('data-lucide', 'pause');
            lucide.createIcons();
            switchTab('main');
        });
        favoritesList.appendChild(row);
    });
}

buildFavoritesUI();
buildWallpaperUI();
loadTrack();
setWallpaper("classic");
