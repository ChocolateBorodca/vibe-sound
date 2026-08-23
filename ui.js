let activeMenuType = null;
let activeTargetId = null;

const favoritesList = document.getElementById('favorites-list');
const wallpaperGrid = document.getElementById('wallpaper-grid');
const tgMenu = document.getElementById('tg-context-menu');

function openContextMenu(e, type, id) {
    e.stopPropagation();
    activeMenuType = type;
    activeTargetId = id;
    
    tgMenu.style.display = 'block';
    tgMenu.style.left = `${e.clientX - 140}px`;
    tgMenu.style.top = `${e.clientY + 10}px`;

    const delBtn = document.getElementById('tg-menu-delete');
    if (id === "classic") delBtn.style.display = 'none';
    else delBtn.style.display = 'flex';
}

document.addEventListener('click', () => {
    tgMenu.style.display = 'none';
});

document.getElementById('tg-menu-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    tgMenu.style.display = 'none';

    if (activeMenuType === 'track') {
        if (typeof deleteTrackFromDB === 'function') {
            deleteTrackFromDB(activeTargetId, () => {
                const trackIdx = tracks.findIndex(t => t.id === activeTargetId);
                if (trackIdx !== -1) {
                    tracks.splice(trackIdx, 1);
                    buildFavoritesUI();
                    if (currentIndex >= tracks.length) currentIndex = 0;
                    loadTrack();
                }
            });
        }
    } else if (activeMenuType === 'wallpaper') {
        if (typeof deleteWallpaperFromDB === 'function') {
            deleteWallpaperFromDB(activeTargetId, () => {
                const wpIdx = wallpapers.findIndex(w => w.id === activeTargetId);
                if (wpIdx !== -1) {
                    wallpapers.splice(wpIdx, 1);
                    buildWallpaperUI();
                    if (currentWallpaperId === activeTargetId) setWallpaper("classic");
                }
            });
        }
    }
});

document.getElementById('tg-menu-share').addEventListener('click', (e) => {
    e.stopPropagation();
    tgMenu.style.display = 'none';

    let shareText = "";
    const siteUrl = window.location.origin;

    if (activeMenuType === 'track') {
        const track = tracks.find(t => t.id === activeTargetId);
        shareText = `🎵 Слушаю трек «${track.title}» в Vibe Sound! Зацени мой личный плеер: ${siteUrl}`;
    } else {
        shareText = `🎨 Зацени крутые анимированные обои в моем плеере Vibe Sound! Слушай музыку со стилем здесь: ${siteUrl}`;
    }

    navigator.clipboard.writeText(shareText).then(() => {
        alert("Ссылка скопирована в буфер обмена!");
    });
});

function buildWallpaperUI() {
    if (!wallpaperGrid) return;
    wallpaperGrid.innerHTML = '';
    wallpapers.forEach((wp) => {
        const card = document.createElement('div');
        card.className = `wallpaper-card-item ${wp.id === currentWallpaperId ? 'active' : ''}`;
        const bgStyle = wp.isClassic ? 'background: #0d0d11;' : `background-image: url('${wp.url}');`;
        
        card.innerHTML = `
            <div class="wallpaper-preview" style="${bgStyle}"></div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 0 4px;">
                <span>${wp.name}</span>
                <button class="more-actions-btn" onclick="openContextMenu(event, 'wallpaper', '${wp.id}')">
                    <i data-lucide="more-vertical"></i>
                </button>
            </div>
        `;
        card.addEventListener('click', () => setWallpaper(wp.id));
        wallpaperGrid.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();
}

function buildFavoritesUI() {
    if (!favoritesList) return;
    favoritesList.innerHTML = '';
    tracks.forEach((track, i) => {
        const row = document.createElement('div');
        row.className = `track-row ${i === currentIndex ? 'playing-now' : ''}`;
        
        const imgStyle = (!track.cover || track.cover === "") ? 'background: linear-gradient(135deg, #1e1b4b, #0f172a)' : '';
        const imgSrc = (!track.cover || track.cover === "") ? '' : track.cover;

        row.innerHTML = `
            <img src="${imgSrc}" style="${imgStyle}" alt="">
            <div class="track-row-info">
                <div class="track-row-title">${track.title}</div>
                <div class="track-row-artist">${track.artist}</div>
            </div>
            <button class="more-actions-btn" onclick="openContextMenu(event, 'track', ${track.id})">
                <i data-lucide="more-vertical"></i>
            </button>
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
    if (window.lucide) lucide.createIcons();
}
