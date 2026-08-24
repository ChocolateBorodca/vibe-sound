// Отдельный чистый файл для вывода треков плейлиста (как в Любимых)
function renderSinglePlaylistView(container, plIdx) {
    const pl = localPlaylists[plIdx];
    if (!pl) { currentOpenPlaylistIdx = null; if (typeof renderPlaylistsUI === 'function') renderPlaylistsUI(); return; }

    let plTracks = [];
    pl.trackIds.forEach(id => {
        let found = tracks.find(t => t.id === id);
        if (found) plTracks.push(found);
    });

    container.innerHTML = `
        <div class="playlist-container" style="max-height: calc(88vh - 160px); overflow-y: auto; width:100%;">
            <div class="playlist-top-bar" style="margin-bottom:24px;">
                <div style="display:flex; align-items:center; gap:16px;">
                    <button class="upload-action-btn" id="back-to-playlists-btn" style="padding:6px 12px;"><i data-lucide="arrow-left"></i> Назад</button>
                    <div class="playlist-header-text" style="font-size:18px; text-transform:none; color:#fff;">${pl.name}</div>
                </div>
                <div style="font-size:12px; color:rgba(255,255,255,0.4);">${plTracks.length} аудиозаписей</div>
            </div>

            <div class="tracks-list" id="inner-playlist-tracks-box"></div>
        </div>
    `;

    document.getElementById('back-to-playlists-btn').addEventListener('click', () => {
        currentOpenPlaylistIdx = null;
        if (typeof renderPlaylistsUI === 'function') renderPlaylistsUI();
    });

    const tracksBox = document.getElementById('inner-playlist-tracks-box');
    if (plTracks.length === 0) {
        tracksBox.innerHTML = '<div style="color:rgba(255,255,255,0.3); font-size:13px; text-align:center; padding:30px 0;">В этом плейлисте пока нет треков</div>';
    } else {
        plTracks.forEach((track) => {
            const row = document.createElement('div');
            const isPlayingNow = (tracks[currentIndex] && tracks[currentIndex].id === track.id);
            row.className = `track-row ${isPlayingNow ? 'playing-now' : ''}`;
            
            const imgStyle = (!track.cover || track.cover === "") ? 'background: linear-gradient(135deg, #1e1b4b, #0f172a)' : '';
            const imgSrc = (!track.cover || track.cover === "") ? '' : track.cover;

            row.innerHTML = `
                <img src="${imgSrc}" style="${imgStyle}" alt="">
                <div class="track-row-info">
                    <div class="track-row-title">${track.title}</div>
                    <div class="track-row-artist">${track.artist}</div>
                </div>
            `;
            
            row.addEventListener('click', () => {
                let mainIdx = tracks.findIndex(t => t.id === track.id);
                if (mainIdx !== -1) {
                    currentIndex = mainIdx;
                    if (typeof loadTrack === 'function') loadTrack();
                    const audio = document.getElementById('audio');
                    if (audio) {
                        audio.play().catch(() => {});
                        const playIcon = document.getElementById('play-icon');
                        if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
                        if (window.lucide) lucide.createIcons();
                    }
                    renderSinglePlaylistView(container, plIdx);
                }
            });

            tracksBox.appendChild(row);
        });
    }

    if (window.lucide) lucide.createIcons();
}

function playEntirePlaylist(idx) {
    const pl = localPlaylists[idx];
    if (!pl || pl.trackIds.length === 0) return;
    
    // Ищем первый трек из плейлиста в общем списке Медиатеки
    let matchIdx = tracks.findIndex(t => t.id === pl.trackIds[0]);
    if (matchIdx !== -1) {
        currentIndex = matchIdx;
        if (typeof loadTrack === 'function') loadTrack();
        const audio = document.getElementById('audio');
        if (audio) {
            audio.play().catch(() => {});
            const playIcon = document.getElementById('play-icon');
            if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
            if (window.lucide) lucide.createIcons();
        }
    }
}

function deletePlaylistAction(idx) {
    localPlaylists.splice(idx, 1);
    localStorage.setItem('vibe_custom_playlists', JSON.stringify(localPlaylists));
    currentOpenPlaylistIdx = null;
    if (typeof renderPlaylistsUI === 'function') renderPlaylistsUI();
}

// Связываем автоматическое переключение вкладок
setTimeout(() => {
    const menuItems = document.querySelectorAll('.sidebar .menu-item');
    menuItems.forEach(item => {
        if (item.textContent.includes('Плейлисты')) {
            item.id = 'menu-playlists';
            item.addEventListener('click', () => {
                if (typeof switchTab === 'function') {
                    switchTab('playlists');
                }
            });
        }
    });
}, 1600);
