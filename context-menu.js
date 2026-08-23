let activeMenuType = null;
let activeTargetId = null;

const favoritesList = document.getElementById('favorites-list');
const wallpaperGrid = document.getElementById('wallpaper-grid');

let tgMenu = document.getElementById('tg-context-menu');
if (!tgMenu) {
    tgMenu = document.createElement('div');
    tgMenu.id = 'tg-context-menu';
    document.body.appendChild(tgMenu);
}

tgMenu.style.cssText = `
    position: fixed;
    display: none;
    background: rgba(15, 15, 22, 0.7);
    backdrop-filter: blur(35px) saturate(150%);
    -webkit-backdrop-filter: blur(35px) saturate(150%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 14px;
    width: 120px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    z-index: 999999;
    padding: 4px;
`;

tgMenu.innerHTML = `
    <div class="tg-menu-item delete" id="tg-menu-delete" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: #ff4d6d; font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 10px; transition: background 0.15s; white-space: nowrap; width: 100%;">
        <i data-lucide="trash-2" style="width: 16px; height: 16px; color: #ff4d6d;"></i> Удалить
    </div>
`;

tgMenu.addEventListener('mouseover', (e) => {
    const item = e.target.closest('.tg-menu-item');
    if (item && item.classList.contains('delete')) {
        item.style.background = 'rgba(255, 77, 109, 0.15)';
    }
});
tgMenu.addEventListener('mouseout', (e) => {
    const item = e.target.closest('.tg-menu-item');
    if (item) item.style.background = 'none';
});

function openContextMenu(e, type, id) {
    e.stopPropagation();
    activeMenuType = type;
    activeTargetId = id;
    
    if (id === "classic") {
        alert("Это базовое оформление плеера, его нельзя удалить.");
        return;
    }
    
    tgMenu.style.display = 'block';
    
    const rect = e.currentTarget.getBoundingClientRect();
    tgMenu.style.left = `${rect.right - 135}px`;
    tgMenu.style.top = `${rect.bottom + 6}px`;
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

function buildWallpaperUI() {
    if (!wallpaperGrid) return;
    wallpaperGrid.innerHTML = '';
    wallpapers.forEach((wp) => {
        const card = document.createElement('div');
        card.className = `wallpaper-card-item ${wp.id === currentWallpaperId ? 'active' : ''}`;
        const bgStyle = wp.isClassic ? 'background: #0d0d11;' : `background-image: url('${wp.url}');`;
        
        // ИСПРАВЛЕНО: Заменили тег иконки Lucide на яркие текстовые три точки •••
        card.innerHTML = `
            <div class="wallpaper-preview" style="${bgStyle}"></div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 0 4px; gap: 8px;">
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:80px;">${wp.name}</span>
                <button class="more-actions-btn" onclick="openContextMenu(event, 'wallpaper', '${wp.id}')" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; cursor: pointer; padding: 2px 10px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; font-size: 14px; letter-spacing: 1px;">
                    •••
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

        // ИСПРАВЛЕНО: Заменили тег иконки Lucide на яркие текстовые три точки •••
        row.innerHTML = `
            <img src="${imgSrc}" style="${imgStyle}" alt="">
            <div class="track-row-info">
                <div class="track-row-title">${track.title}</div>
                <div class="track-row-artist">${track.artist}</div>
            </div>
            <button class="more-actions-btn" onclick="openContextMenu(event, 'track', ${track.id})" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; cursor: pointer; padding: 2px 10px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; font-size: 14px; letter-spacing: 1px;">
                •••
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
