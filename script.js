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
    
    // ИСПРАВЛЕНО: Защита индекса от вылета за границы массива
    if (currentIndex >= tracks.length || currentIndex < 0) {
        currentIndex = 0;
    }

    const current = tracks[currentIndex];
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
}
