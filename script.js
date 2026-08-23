// === ВАШ МЕДИАПЛЕЕР С ФАЙЛАМИ ===
// При необходимости измените названия на ваши реальные файлы mp3 и jpg!
const tracks = [
    {
        title: "Night , Blooming Jasmine",
        artist: "fakemink",
        audio: "https://hlx6folrupjwnm6y.public.blob.vercel-storage.com/fakemink%20-%20Night%2C%20Blooming%20Jasmine.mp3",
        cover: "https://hlx6folrupjwnm6y.public.blob.vercel-storage.com/images%20%282%29.png"
    },
    {
        title: "Любимый Хит",
        artist: "Популярный Артист",
        audio: "music2.mp3",
        cover: "cover2.jpg"
    }
];

let currentIndex = 0;
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

// Загрузка информации о треке
function loadTrack() {
    const current = tracks[currentIndex];
    audio.src = current.audio;
    cover.src = current.cover;
    title.textContent = current.title;
    artist.textContent = current.artist;
    progress.value = 0;

    // Обновляем маркер играющего трека в плейлисте Любимого
    document.querySelectorAll('.track-row').forEach((row, i) => {
        row.classList.toggle('playing-now', i === currentIndex);
    });
}

// Функция включить / выключить
function togglePlay() {
    if (audio.paused) {
        audio.play();
        playIcon.setAttribute('data-lucide', 'pause');
    } else {
        audio.pause();
        playIcon.setAttribute('data-lucide', 'play');
    }
    lucide.createIcons(); // Перерисовываем иконку play/pause
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

// Слушатели событий управления
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

// Логика работы таймлайна (перемотка)
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

// Переключение вкладок меню (Главная / Любимое)
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.getElementById(`menu-${tabName}`).classList.add('active');

    // Меняем заголовок страницы сверху
    document.getElementById('page-title').textContent = tabName === 'main' ? 'Главная' : 'Любимое';
}

// Назначаем обработчики клика на вкладки бокового меню
document.getElementById('menu-main').addEventListener('click', () => switchTab('main'));
document.getElementById('menu-favorites').addEventListener('click', () => switchTab('favorites'));

// Генерация списка треков на странице Любимое
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
            switchTab('main'); // Возвращаемся на главный экран плеера при выборе трека
        });
        favoritesList.appendChild(row);
    });
}

// Запуск приложения
buildFavoritesUI();
loadTrack();
