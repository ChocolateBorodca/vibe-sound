if (!document.querySelector('script[src="stats.js"]')) {
    const s1 = document.createElement('script'); s1.src = 'stats.js'; document.head.appendChild(s1);
    const s3 = document.createElement('script'); s3.src = 'stats-style.js'; document.head.appendChild(s3);
    const s5 = document.createElement('script'); s5.src = 'stats-collector.js'; document.head.appendChild(s5);
    const s6 = document.createElement('script'); s6.src = 'vibe-wave-map.js'; document.head.appendChild(s6);
    const s7 = document.createElement('script'); s7.src = 'vibe-wave-events.js'; document.head.appendChild(s7);
    const s8 = document.createElement('script'); s8.src = 'vibe-playlists.js'; document.head.appendChild(s8);
    const s9 = document.createElement('script'); s9.src = 'vibe-settings.js'; document.head.appendChild(s9);
    const s10 = document.createElement('script'); s10.src = 'vibe-uploader.js'; document.head.appendChild(s10);
    const s11 = document.createElement('script'); s11.src = 'vibe-playlists-view.js'; document.head.appendChild(s11);
}

let activeMenuType = null;
let activeTargetId = null;

const favoritesList = document.getElementById('favorites-list');
const wallpaperGrid = document.getElementById('wallpaper-grid');

function toggleDeleteBtn(e, type, id) {
    e.stopPropagation();
    document.querySelectorAll('.inline-delete-btn').forEach(btn => {
        if (btn.id !== `del-${type}-${id}`) btn.style.display = 'none';
    });
    const targetBtn = document.getElementById(`del-${type}-${id}`);
    if (targetBtn) {
        targetBtn.style.display = (targetBtn.style.display === 'block' || targetBtn.style.display === 'inline-block') ? 'none' : 'inline-block';
    }
}

document.addEventListener('click', () => {
    document.querySelectorAll('.inline-delete-btn').forEach(btn => btn.style.display = 'none');
});

function deleteTrackAction(e, id) {
    e.stopPropagation();
    if (typeof deleteTrackFromDB === 'function') {
        deleteTrackFromDB(id, () => {
            const trackIdx = tracks.findIndex(t => t.id === id);
            if (trackIdx !== -1) {
                let playData = JSON.parse(localStorage.getItem('vibe_detailed_plays') || "{}");
                delete playData[id];
                localStorage.setItem('vibe_detailed_plays', JSON.stringify(playData));
                tracks.splice(trackIdx, 1);
                if (typeof buildFavoritesUI === 'function') buildFavoritesUI();
                if (currentIndex >= tracks.length) currentIndex = 0;
                if (typeof loadTrack === 'function') loadTrack();
                if (typeof buildAdvancedStatsUI === 'function') buildAdvancedStatsUI();
            }
        });
    }
}

function deleteWallpaperAction(e, id) {
    e.stopPropagation();
    if (id === "classic") return;
    if (typeof deleteWallpaperFromDB === 'function') {
        deleteWallpaperFromDB(id, () => {
            const wpIdx = wallpapers.findIndex(w => w.id === id);
            if (wpIdx !== -1) {
                wallpapers.splice(wpIdx, 1);
                if (typeof buildWallpaperUI === 'function') buildWallpaperUI();
                if (currentWallpaperId === id && typeof setWallpaper === 'function') setWallpaper("classic");
                if (typeof buildAdvancedStatsUI === 'function') buildAdvancedStatsUI();
            }
        });
    }
}

function buildWallpaperUI() {
    if (!wallpaperGrid) return;
    wallpaperGrid.innerHTML = '';
    wallpapers.forEach((wp) => {
        const card = document.createElement('div');
        card.className = `wallpaper-card-item ${wp.id === currentWallpaperId ? 'active' : ''}`;
        const bgStyle = wp.isClassic ? 'background: #0d0d11;' : `background-image: url('${wp.url}');`;
        const deleteBtnHtml = wp.isClassic ? '' : `<button id="del-wp-${wp.id}" class="inline-delete-btn" onclick="deleteWallpaperAction(event, '${wp.id}')" style="display: none; background: rgba(255, 77, 109, 0.15); border: 1px solid rgba(255, 77, 109, 0.3); color: #ff4d6d; cursor: pointer; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; transition: all 0.2s;">Удалить</button>`;

        card.innerHTML = `
            <div class="wallpaper-preview" style="${bgStyle}"></div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 0 4px; gap: 8px; width: 100%;">
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:65px;">${wp.name}</span>
                <div style="display:flex; align-items:center; gap: 6px; flex-shrink: 0; position: relative;">
                    ${deleteBtnHtml}
                    <button class="more-actions-btn" onclick="toggleDeleteBtn(event, 'wp', '${wp.id}')" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; cursor: pointer; padding: 2px 10px; border-radius: 8px; font-weight: bold; font-size: 14px; letter-spacing: 1px;">•••</button>
                </div>
            </div>
        `;
        card.addEventListener('click', () => { if (typeof setWallpaper === 'function') setWallpaper(wp.id); });
        wallpaperGrid.appendChild(card);
    });
}

function buildFavoritesUI() {
    if (!favoritesList) return;
    favoritesList.innerHTML = '';
    tracks.forEach((track, i) => {
        const row = document.createElement('div');
        row.className = `track-row ${i === currentIndex ? 'playing-now' : ''}`;
        const imgStyle = (!track.cover || track.cover === "") ? 'background: linear-gradient(135deg, #1e1b4b, #0f172a)' : '';
        const imgSrc = (!track.cover || track.cover === "") ? '' : track.cover;
        const deleteBtnHtml = `<button id="del-track-${track.id}" class="inline-delete-btn" onclick="deleteTrackAction(event, ${track.id})" style="display: none; background: rgba(255, 77, 109, 0.15); border: 1px solid rgba(255, 77, 109, 0.3); color: #ff4d6d; cursor: pointer; padding: 5px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; transition: all 0.2s;">Удалить</button>`;

        row.innerHTML = `
            <img src="${imgSrc}" style="${imgStyle}" alt="">
            <div class="track-row-info">
                <div class="track-row-title">${track.title}</div>
                <div class="track-row-artist">${track.artist}</div>
            </div>
            <div style="display:flex; align-items:center; gap: 8px; z-index: 10; flex-shrink: 0; position: relative;">
                ${deleteBtnHtml}
                <button class="more-actions-btn" onclick="toggleDeleteBtn(event, 'track', ${track.id})" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; cursor: pointer; padding: 2px 10px; border-radius: 8px; font-weight: bold; font-size: 14px; letter-spacing: 1px;">•••</button>
            </div>
        `;
        row.addEventListener('click', () => {
            currentIndex = i;
            if (typeof loadTrack === 'function') loadTrack();
            if (audio) audio.play().catch(() => {});
            if (typeof switchTab === 'function') switchTab('main');
        });
        favoritesList.appendChild(row);
    });
}

window.buildFavoritesUI = buildFavoritesUI;
window.buildWallpaperUI = buildWallpaperUI;
