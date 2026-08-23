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
    
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = document.body.getBoundingClientRect();
    
    tgMenu.style.left = `${rect.left - parentRect.left - 160}px`;
    tgMenu.style.top = `${rect.top - parentRect.top}px`;

    const delBtn = document.getElementById('tg-menu-delete');
    if (id === "classic") delBtn.style.display = 'none';
    else delBtn.style.display = 'flex';
}

document.addEventListener('click', () => {
    if (tgMenu) tgMenu.style.display = 'none';
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

    const siteUrl = window.location.origin + window.location.pathname;
    alert("Готовим файл к отправке, подождите секунду...");

    if (activeMenuType === 'track') {
        const track = tracks.find(t => t.id === activeTargetId);
        const reader = new FileReader();
        reader.readAsDataURL(track.audioFile);
        reader.onloadend = function() {
            const base64Audio = reader.result.split(',');
            if (track.coverFile) {
                const coverReader = new FileReader();
                coverReader.readAsDataURL(track.coverFile);
                coverReader.onloadend = function() {
                    const base64Cover = coverReader.result.split(',');
                    const finalUrl = `${siteUrl}?shareType=track&title=${encodeURIComponent(track.title)}&audio=${base64Audio}&cover=${base64Cover}`;
                    copyTextToClipboard(`🎵 Лови трек «${track.title}» в моем плеере Vibe Sound! Кликни, и он сам установится у тебя на сайте: ${finalUrl}`);
                };
            } else {
                const finalUrl = `${siteUrl}?shareType=track&title=${encodeURIComponent(track.title)}&audio=${base64Audio}`;
                copyTextToClipboard(`🎵 Лови трек «${track.title}» в моем плеере Vibe Sound! Кликни, и он сам установится у тебя на сайте: ${finalUrl}`);
            }
        };
    } else if (activeMenuType === 'wallpaper') {
        const wp = wallpapers.find(w => w.id === activeTargetId);
        const reader = new FileReader();
        reader.readAsDataURL(wp.gifFile);
        reader.onloadend = function() {
            const base64Gif = reader.result.split(',');
            const finalUrl = `${siteUrl}?shareType=wp&wpId=${wp.id}&url=${base64Gif}`;
            copyTextToClipboard(`🎨 Зацени эти анимированные обои в плеере Vibe Sound! Кликни по ссылке, чтобы сразу поставить их себе на фон: ${finalUrl}`);
        };
    }
});

function copyTextToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand("copy");
        alert("Умная ссылка скопирована! Отправь её другу в ЛС, при переходе файл сам загрузится к нему в плеер.");
    } catch (err) {
        alert("Не удалось скопировать ссылку.");
    }
    document.body.removeChild(textarea);
}

function buildWallpaperUI() {
    if (!wallpaperGrid) return;
    wallpaperGrid.innerHTML = '';
    wallpapers.forEach((wp) => {
        const card = document.createElement('div');
        card.className = `wallpaper-card-item ${wp.id === currentWallpaperId ? 'active' : ''}`;
        const bgStyle = wp.isClassic ? 'background: #0d0d11;' : `background-image: url('${wp.url}');`;
        
        card.innerHTML = `
            <div class="wallpaper-preview" style="${bgStyle}"></div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 0 4px; gap: 8px;">
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:80px;">${wp.name}</span>
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
