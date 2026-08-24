let localPlaylists = JSON.parse(localStorage.getItem('vibe_custom_playlists') || "[]");
let tempPlaylistCover = "";
let selectedTrackIdsForNewPL = [];
let currentOpenPlaylistIdx = null;

function renderPlaylistsUI() {
    const playlistsTab = document.getElementById('tab-playlists');
    if (!playlistsTab) return;

    // Если открыт конкретный плейлист — вызываем отрисовку из второго (нового) файла
    if (currentOpenPlaylistIdx !== null) {
        if (typeof renderSinglePlaylistView === 'function') {
            renderSinglePlaylistView(playlistsTab, currentOpenPlaylistIdx);
        }
        return;
    }

    playlistsTab.innerHTML = `
        <div class="playlist-container" style="max-height: calc(88vh - 160px); overflow-y: auto; width:100%;">
            <div class="playlist-top-bar">
                <div class="playlist-header-text">Ваши Плейлисты</div>
                <button class="upload-action-btn" id="open-create-modal-btn">
                    <i data-lucide="plus"></i> Создать плейлист
                </button>
            </div>
            <div id="playlists-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-top: 15px;"></div>
        </div>

        <!-- Стеклянное модальное окно создания плейлиста -->
        <div id="playlist-modal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(15,15,22,0.9); backdrop-filter:blur(30px); -webkit-backdrop-filter:blur(30px); border:1px solid rgba(255,255,255,0.12); padding:24px; border-radius:24px; z-index:999999; width:340px; box-shadow:0 30px 60px rgba(0,0,0,0.6);">
            <div class="playlist-header-text" style="margin-bottom:16px;">Новый плейлист</div>
            <input type="text" id="modal-pl-name" placeholder="Название плейлиста" style="width:100%; padding:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fff; margin-bottom:14px; font-size:14px; outline:none;">
            
            <button class="upload-action-btn" style="width:100%; margin-bottom:14px; justify-content:center;" onclick="document.getElementById('modal-pl-cover-input').click()">
                🖼️ Обложка из галереи
            </button>
            <input type="file" id="modal-pl-cover-input" accept="image/*" style="display:none;">
            <div id="modal-pl-cover-preview" style="display:none; width:60px; height:60px; border-radius:8px; background-size:cover; background-position:center; margin:0 auto 14px;"></div>

            <div class="playlist-header-text" style="font-size:11px; margin-bottom:8px;">Выберите треки:</div>
            <div id="modal-tracks-checklist" style="max-height:120px; overflow-y:auto; background:rgba(0,0,0,0.2); padding:8px; border-radius:12px; margin-bottom:16px; display:flex; flex-direction:column; gap:6px;"></div>

            <div style="display:flex; gap:10px;">
                <button class="upload-action-btn" id="modal-cancel-btn" style="flex:1; justify-content:center; background:rgba(255,255,255,0.02);">Отмена</button>
                <button class="upload-action-btn" id="modal-save-btn" style="flex:1; justify-content:center; background:#ff2a74; border-color:#ff2a74;">Создать</button>
            </div>
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
            
            card.addEventListener('click', () => {
                currentOpenPlaylistIdx = plIdx;
                renderPlaylistsUI();
            });

            const coverStyle = pl.cover ? `background-image: url('${pl.cover}');` : 'background: linear-gradient(135deg, #1e1b4b, #ff2a74);';
            
            card.innerHTML = `
                <div style="width: 100%; height: 140px; border-radius: 12px; background-size: cover; background-position: center; margin-bottom: 8px; ${coverStyle}"></div>
                <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pl.name}</div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 10px;">${pl.trackIds.length} треков</div>
                <div style="display:flex; gap: 4px; justify-content: center;" onclick="event.stopPropagation();">
                    <button class="upload-action-btn" style="padding: 4px 10px; font-size:11px;" onclick="playEntirePlaylist(${plIdx})">▶️ Поток</button>
                    <button class="upload-action-btn" style="padding: 4px 10px; font-size:11px; background:rgba(255,77,109,0.1); color:#ff4d6d; border-color:rgba(255,77,109,0.2);" onclick="deletePlaylistAction(${plIdx})">🗑️</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    document.getElementById('open-create-modal-btn').addEventListener('click', openCreatePlaylistModal);
    if (window.lucide) lucide.createIcons();
}

function openCreatePlaylistModal() {
    const modal = document.getElementById('playlist-modal');
    const checklist = document.getElementById('modal-tracks-checklist');
    if (!modal || !checklist) return;

    tempPlaylistCover = "";
    selectedTrackIdsForNewPL = [];
    document.getElementById('modal-pl-name').value = "";
    document.getElementById('modal-pl-cover-preview').style.display = "none";

    checklist.innerHTML = "";
    if (tracks.length === 0) {
        checklist.innerHTML = '<div style="color:rgba(255,255,255,0.3); font-size:12px; text-align:center;">Медиатека пуста</div>';
    } else {
        tracks.forEach(t => {
            const label = document.createElement('label');
            label.style.cssText = 'display:flex; align-items:center; gap:8px; font-size:13px; color:#fff; cursor:pointer;';
            label.innerHTML = `<input type="checkbox" value="${t.id}" style="accent-color:#ff2a74;"> <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">${t.title}</span>`;
            checklist.appendChild(label);
        });
    }

    modal.style.display = "block";

    document.getElementById('modal-pl-cover-input').onchange = function(e) {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        tempPlaylistCover = URL.createObjectURL(file);
        
        const prev = document.getElementById('modal-pl-cover-preview');
        prev.style.backgroundImage = `url('${tempPlaylistCover}')`;
        prev.style.display = "block";
    };

    document.getElementById('modal-cancel-btn').onclick = () => modal.style.display = "none";
    
    document.getElementById('modal-save-btn').onclick = () => {
        const nameInput = document.getElementById('modal-pl-name').value.trim();
        if (!nameInput) { alert("Введите название!"); return; }

        const checkedBoxes = checklist.querySelectorAll('input[type="checkbox"]:checked');
        checkedBoxes.forEach(box => selectedTrackIdsForNewPL.push(parseInt(box.value, 10)));

        localPlaylists.push({
            name: nameInput,
            cover: tempPlaylistCover || "",
            trackIds: selectedTrackIdsForNewPL
        });

        localStorage.setItem('vibe_custom_playlists', JSON.stringify(localPlaylists));
        modal.style.display = "none";
        renderPlaylistsUI();
    };
}
