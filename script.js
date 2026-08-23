const tracks = [];
const wallpapers = [
    { id: "classic", name: "Классический", url: "none", isClassic: true }
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
    const current = tracks[currentIndex];
    audio.src = current.audio;
    title.textContent = current.title;
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

function togglePlay() {
    if (tracks.length === 0) return;
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
    if (tracks.length === 0) return;
    currentIndex = (currentIndex + 1) % tracks.length;
    loadTrack();
    audio.play();
    playIcon.setAttribute('data-lucide', 'pause');
    lucide.createIcons();
}

function prevTrack() {
    if (tracks.length === 0) return;
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
        tabName === 'main' ? 'Главная' : (tabName === 'favorites' ? 'Медиатека' : 'Обои');
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
        if (typeof saveSettingToDB === "function") saveSettingToDB("currentWallpaper", wpId);
    }

    document.querySelectorAll('.wallpaper-card-item').forEach((card, i) => {
        card.classList.toggle('active', wallpapers[i].id === wpId);
    });
}

document.getElementById('local-audio-input').addEventListener('change', function(e) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const blobUrl = URL.createObjectURL(file);
    const cleanFileName = file.name.replace(/\.[^/.]+$/, "");

    const newTrack = {
        title: cleanFileName,
        artist: "С телефона",
        audio: blobUrl,
        cover: "",
        audioFile: file
    };

    if (typeof saveTrackToDB === "function") {
        saveTrackToDB(newTrack, function(insertedId) {
            newTrack.id = insertedId;
            tracks.push(newTrack);
            buildFavoritesUI();
            currentIndex = tracks.length - 1;
            loadTrack();
            audio.play();
            playIcon.setAttribute('data-lucide', 'pause');
            lucide.createIcons();
            switchTab('main');
        });
    }
});

document.getElementById('local-cover-input').addEventListener('change', function(e) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (tracks.length === 0) return;

    const imgBlobUrl = URL.createObjectURL(file);
    const currentTrack = tracks[currentIndex];
    
    currentTrack.cover = imgBlobUrl;
    currentTrack.coverFile = file;

    if (typeof updateTrackInDB === "function") {
        updateTrackInDB(currentTrack);
    }

    loadTrack();
    buildFavoritesUI();
});

document.getElementById('local-bg-input').addEventListener('change', function(e) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const blobUrl = URL.createObjectURL(file);
    const customId = "custom-" + Date.now();

    const newWallpaper = {
        id: customId,
        name: "Мои обои",
        url: blobUrl,
        gifFile: file
    };

    if (typeof saveWallpaperToDB === "function") {
        saveWallpaperToDB(newWallpaper, function() {
            wallpapers.push(newWallpaper);
            buildWallpaperUI();
            setWallpaper(customId);
        });
    }
});

buildFavoritesUI();
buildWallpaperUI();
loadTrack();
