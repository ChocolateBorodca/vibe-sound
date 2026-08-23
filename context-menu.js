const favoritesList = document.getElementById('favorites-list');
const wallpaperGrid = document.getElementById('wallpaper-grid');

// Функция удаления трека, которая вызывается по клику на встроенную кнопку
function deleteTrackAction(e, id) {
    e.stopPropagation();
    if (typeof deleteTrackFromDB === 'function') {
        deleteTrackFromDB(id, () => {
            const trackIdx = tracks.findIndex(t => t.id === id);
            if (trackIdx !== -1) {
                tracks.splice(trackIdx, 1);
                buildFavoritesUI();
                if (currentIndex >= tracks.length) currentIndex = 0;
                loadTrack();
            }
        });
    }
}

// Функция удаления обоев, которая вызывается по клику на встроенную кнопку
function deleteWallpaperAction(e, id) {
    e.stopPropagation();
    if (id === "classic") return;
    if (typeof deleteWallpaperFromDB === 'function') {
        deleteWallpaperFromDB(id, () => {
            const wpIdx = wallpapers.findIndex(w => w.id === id);
            if (wpIdx !== -1) {
                wallpapers.splice(wpIdx, 1);
                buildWallpaperUI();
                if (currentWallpaperId === id) setWallpaper("classic");
            }
        });
    }
}

// Отрисовка сетки обоев со встроенной кнопкой "Удалить" слева от точек
function buildWallpaperUI() {
    if (!wallpaperGrid) return;
    wallpaperGrid.innerHTML = '';
    wallpapers.forEach((wp) => {
        const card = document.createElement('div');
        card.className = `wallpaper-card-item ${wp.id === currentWallpaperId ? 'active' : ''}`;
        const bgStyle = wp.isClassic ? 'background: #0d0d11;' : `background-image: url('${wp.url}');`;
        
        // Кнопка удалить отображается только для кастомных обоев (для классики прячем)
        const deleteBtnHtml = wp.isClassic ? '' : `
            <button onclick="deleteWallpaperAction(event, '${wp.id}')" style="background: rgba(255, 77, 109, 0.1); border: 1px solid rgba(255, 77, 109, 0.2); color: #ff4d6d; cursor: pointer; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; transition: all 0.2s;">
                Удалить
            </button>
        `;

        card.innerHTML = `
            <div class="wallpaper-preview" style="${bgStyle}"></div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 0 4px; gap: 8px;">
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:70px;">${wp.name}</span>
                <div style="display:flex; align-items:center; gap: 6px;">
                    ${deleteBtnHtml}
                    <button style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; cursor: pointer; padding: 2px 10px; border-radius: 8px; font-weight: bold; font-size: 14px; letter-spacing: 1px; pointer-events: none;">
                        •••
                    </button>
                </div>
            </div>
        `;
        
        // Эффект наведения на встроенную кнопку удаления обоев
        const delBtnElement = card.querySelector('button[onclick*="deleteWallpaperAction"]');
        if (delBtnElement) {
            delBtnElement.addEventListener('mouseover', () => { delBtnElement.style.background = 'rgba(255, 77, 109, 0.25)'; });
            delBtnElement.addEventListener('mouseout', () => { delBtnElement.style.background = 'rgba(255, 77, 109, 0.1)'; });
        }

        card.addEventListener('click', () => setWallpaper(wp.id));
        wallpaperGrid.appendChild(card);
    });
}

// Отрисовка списка треков со встроенной кнопкой "Удалить" слева от точек
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
            <div style="display:flex; align-items:center; gap: 8px; z-index: 10;">
                <button onclick="deleteTrackAction(event, ${track.id})" style="background: rgba(255, 77, 109, 0.1); border: 1px solid rgba(255, 77, 109, 0.2); color: #ff4d6d; cursor: pointer; padding: 5px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; transition: all 0.2s;">
                    Удалить
                </button>
                <button style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; cursor: pointer; padding: 2px 10px; border-radius: 8px; font-weight: bold; font-size: 14px; letter-spacing: 1px; pointer-events: none;">
                    •••
                </button>
            </div>
        `;

        // Эффект наведения на встроенную кнопку удаления трека
        const delBtnElement = row.querySelector('button[onclick*="deleteTrackAction"]');
        if (delBtnElement) {
            delBtnElement.addEventListener('mouseover', () => { delBtnElement.style.background = 'rgba(255, 77, 109, 0.25)'; });
            delBtnElement.addEventListener('mouseout', () => { delBtnElement.style.background = 'rgba(255, 77, 109, 0.1)'; });
        }

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
