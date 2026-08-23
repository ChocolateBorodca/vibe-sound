let localPlaylists = JSON.parse(localStorage.getItem('vibe_custom_playlists') || "[]");

function renderPlaylistsUI() {
    // Находим вкладку плейлистов (четвертый элемент в разметке)
    const tabContents = document.querySelectorAll('.tab-content');
    let playlistsTab = null;
    
    // Ищем вкладку, у которой нет жесткого ID, методом исключения
    tabContents.forEach(tab => {
        if (tab.id !== 'tab-main' && tab.id !== 'tab-favorites' && tab.id !== 'tab-wallpaper' && tab.id !== 'tab-stats' && tab.id !== 'tab-wave') {
            playlistsTab = tab;
        }
    });

    if (!playlistsTab) return;
    
    // Сбрасываем старый ID для надежной работы системного переключателя
    playlistsTab.id = 'tab-playlists';

    playlistsTab.innerHTML = `
        <div class="playlist-container" style="max-height: calc(88vh - 160px); overflow-y: auto;">
            <div class="playlist-top-bar">
                <div class="playlist-header-text">Ваши Плейлисты</div>
                <button class="upload-action-btn" id="create-playlist-btn">
                    <i data-lucide="plus"></i> Создать плейлист
                </button>
            </div>
            
            <div id="playlists-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-top: 15px;"></div>
        </div>
    `;

    const grid = document.getElementById('playlists-grid');
    if (localPlaylists.length === 0) {
        grid.innerHTML = '<div style="color:rgba(255,255,255,0.3); font-size:13px; grid-column: 1/-1; text-align:center; padding: 40px 0;">У вас пока нет созданных плейлистов</div>';
    } else {
        localPlaylists.forEach((pl, plIdx) => {
            const card = document.createElement('div');
            card.style.cssText = 'background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 12px; cursor: pointer; text-align: center; backdrop-filter: blur(10px); transition: transform 0.2s;';
            card.addEventListener('mouseover', () => card.style.transform = 'translateY(-2px)');
            card.addEventListener('mouseout', () => card.style.transform = 'none');
            
            const coverStyle = pl.cover ? `background-image: url('${pl.cover}');` : 'background: linear-gradient(135deg, #1e1b4b, #ff2a74);';
            
            card.innerHTML = `
                <div style="width: 100%; height: 140px; border-radius: 12px; background-size: cover; background-position: center; margin-bottom: 8px; ${coverStyle}"></div>
                <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pl.name}</div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 10px;">${pl.trackIds.length} треков</div>
                <div style="display:flex; gap: 4px; justify-content: center;">
                    <button class="upload-action-btn" style="padding: 4px 10px; font-size:11px;" onclick="playPlaylistAction(event, ${plIdx})">▶️ Включить</button>
                    <button class="upload-action-btn" style="padding: 4px 10px; font-size:11px; background:rgba(255,77,109,0.1); color:#ff4d6d; border-color:rgba(255,77,109,0.2);" onclick="deletePlaylistAction(event, ${plIdx})">🗑️</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    document.getElementById('create-playlist-btn').addEventListener('click', createPlaylistModal);
    if (window.lucide) lucide.createIcons();
}

function createPlaylistModal() {
    const name = prompt("Введите название нового плейлиста:", "Мой Вайб");
    if (!name) return;

    if (tracks.length === 0) {
        alert("Сначала загрузите треки в Медиатеку (Любимое), чтобы добавить их в плейлист!");
        return;
    }

    // Собираем список песен для добавления
    let promptText = "Доступные треки. Введите номера через запятую (например: 1,3,4):\n";
    tracks.forEach((t, i) => {
        promptText += `${i + 1}. ${t.title}\n`;
    });
    
    const choices = prompt(promptText, "1");
    if (!choices) return;

    let selectedIds = [];
    choices.split(',').forEach(num => {
        let idx = parseInt(num.trim(), 10) - 1;
        if (tracks[idx]) selectedIds.push(tracks[idx].id);
    });

    // Запрос обложки через ссылку (URL фото или GIF)
    const coverUrl = prompt("Вставьте ссылку на обложку (или оставьте пустым для стандартного градиента):", "");

    localPlaylists.push({
        name: name,
        cover: coverUrl || "",
        trackIds: selectedIds
    });

    localStorage.setItem('vibe_custom_playlists', JSON.stringify(localPlaylists));
    renderPlaylistsUI();
}

function playPlaylistAction(e, idx) {
    e.stopPropagation();
    const pl = localPlaylists[idx];
    if (!pl || pl.trackIds.length === 0) return;

    // Находим первый существующий трек из плейлиста в общем массиве
    let firstTrackId = pl.trackIds[0];
    let matchIdx = tracks.findIndex(t => t.id === firstTrackId);
    
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
        alert(`▶️ Запущено воспроизведение плейлиста: ${pl.name}`);
    }
}

function deletePlaylistAction(e, idx) {
    e.stopPropagation();
    localPlaylists.splice(idx, 1);
    localStorage.setItem('vibe_custom_playlists', JSON.stringify(localPlaylists));
    renderPlaylistsUI();
}

// Привязываем вкладку левого меню
setTimeout(() => {
    const menuItems = document.querySelectorAll('.sidebar .menu-item');
    menuItems.forEach(item => {
        if (item.textContent.includes('Плейлисты')) {
            item.id = 'menu-playlists';
            item.addEventListener('click', () => {
                if (typeof switchTab === 'function') {
                    switchTab('playlists');
                    document.getElementById('page-title').textContent = "Плейлисты";
                    renderPlaylistsUI();
                }
            });
        }
    });
}, 1600);
