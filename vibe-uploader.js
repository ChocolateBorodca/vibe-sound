// Автономный загрузчик треков, обложек и обоев с матовым окном тегов
setTimeout(() => {
    const audioInput = document.getElementById('local-audio-input');
    const coverInput = document.getElementById('local-cover-input');
    const bgInput = document.getElementById('local-bg-input');

    // Создаем стильное стеклянное модальное окно для ввода тегов, если его еще нет
    let uploadModal = document.getElementById('vibe-upload-tags-modal');
    if (!uploadModal) {
        uploadModal = document.createElement('div');
        uploadModal.id = 'vibe-upload-tags-modal';
        uploadModal.style.cssText = "display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(15,15,22,0.9); backdrop-filter:blur(30px); -webkit-backdrop-filter:blur(30px); border:1px solid rgba(255,255,255,0.12); padding:24px; border-radius:24px; z-index:9999999; width:340px; box-shadow:0 30px 60px rgba(0,0,0,0.6); color:#fff; font-family:'Inter', sans-serif;";
        document.body.appendChild(uploadModal);
    }

    if (audioInput) {
        audioInput.addEventListener('change', function(e) {
            if (!e.target.files || e.target.files.length === 0) return;
            const file = e.target.files[0];

            const blobUrl = URL.createObjectURL(file);
            const cleanFileName = file.name.replace(/\.[^/.]+$/, "");

            // Открываем стеклянное модальное окно для ввода данных трека перед добавлением
            uploadModal.innerHTML = `
                <div style="font-size:16px; font-weight:600; color:#fff; margin-bottom:16px; letter-spacing:0.5px;">Параметры новой песни</div>
                
                <div style="font-size:11px; color:rgba(255,255,255,0.4); text-transform:uppercase; margin-bottom:6px; font-weight:600;">Название трека</div>
                <input type="text" id="vibe-ins-title" value="${cleanFileName}" style="width:100%; padding:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fff; margin-bottom:14px; font-size:14px; outline:none;">
                
                <div style="font-size:11px; color:rgba(255,255,255,0.4); text-transform:uppercase; margin-bottom:6px; font-weight:600;">Исполнитель</div>
                <input type="text" id="vibe-ins-artist" placeholder="Например: Smokepurpp" style="width:100%; padding:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fff; margin-bottom:14px; font-size:14px; outline:none;">
                
                <div style="font-size:11px; color:rgba(255,255,255,0.4); text-transform:uppercase; margin-bottom:6px; font-weight:600;">Жанр (Для Моей Волны)</div>
                <input type="text" id="vibe-ins-genre" placeholder="Например: Рэп, Trap, Phonk" style="width:100%; padding:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fff; margin-bottom:20px; font-size:14px; outline:none;">

                <div style="display:flex; gap:10px;">
                    <button class="upload-action-btn" id="vibe-upload-cancel" style="flex:1; justify-content:center; background:rgba(255,255,255,0.02); height:40px; border-radius:12px; font-size:14px;">Отмена</button>
                    <button class="upload-action-btn" id="vibe-upload-save" style="flex:1; justify-content:center; background:#ff2a74; border-color:#ff2a74; height:40px; border-radius:12px; font-size:14px;">Добавить</button>
                </div>
            `;

            uploadModal.style.display = "block";

            document.getElementById('vibe-upload-cancel').onclick = () => {
                uploadModal.style.display = "none";
                audioInput.value = ""; // Сбрасываем выбор файла
            };

            document.getElementById('vibe-upload-save').onclick = () => {
                const finalTitle = document.getElementById('vibe-ins-title').value.trim() || cleanFileName;
                const finalArtist = document.getElementById('vibe-ins-artist').value.trim() || "С телефона";
                const finalGenre = document.getElementById('vibe-ins-genre').value.trim() || "Разное";

                const newTrack = {
                    title: finalTitle,
                    artist: finalArtist,
                    genre: finalGenre,
                    audio: blobUrl,
                    cover: "",
                    audioFile: file
                };

                if (typeof saveTrackToDB === "function") {
                    saveTrackToDB(newTrack, function(insertedId) {
                        newTrack.id = insertedId;
                        tracks.push(newTrack);
                        if (typeof buildFavoritesUI === 'function') buildFavoritesUI();
                        currentIndex = tracks.length - 1;
                        if (typeof loadTrack === 'function') loadTrack();
                        
                        const audio = document.getElementById('audio');
                        if (audio) {
                            audio.play().catch(() => {});
                            const playIcon = document.getElementById('play-icon');
                            if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
                            if (window.lucide) lucide.createIcons();
                        }
                        
                        // Прячем модальное окно и переключаем на Главную вкладку плеера
                        uploadModal.style.display = "none";
                        if (typeof switchTab === 'function') switchTab('main');
                    });
                }
            };
        });
    }

    if (coverInput) {
        coverInput.addEventListener('change', function(e) {
            if (!e.target.files || e.target.files.length === 0) return;
            const file = e.target.files[0];
            if (tracks.length === 0) return;

            const imgBlobUrl = URL.createObjectURL(file);
            const currentTrack = tracks[currentIndex];
            currentTrack.cover = imgBlobUrl;
            currentTrack.coverFile = file;

            if (typeof updateTrackInDB === "function") {
                updateTrackInDB(currentTrack);
            }
            if (typeof loadTrack === 'function') loadTrack();
            if (typeof buildFavoritesUI === 'function') buildFavoritesUI();
        });
    }

    if (bgInput) {
        bgInput.addEventListener('change', function(e) {
            if (!e.target.files || e.target.files.length === 0) return;
            const file = e.target.files[0];

            const blobUrl = URL.createObjectURL(file);
            const customId = "custom-" + Date.now();
            const newWallpaper = { id: customId, name: "Мои обои", url: blobUrl, gifFile: file };

            if (typeof saveWallpaperToDB === "function") {
                saveWallpaperToDB(newWallpaper, function() {
                    wallpapers.push(newWallpaper);
                    if (typeof buildWallpaperUI === 'function') buildWallpaperUI();
                    if (typeof setWallpaper === "function") setWallpaper(customId);
                });
            }
        });
    }

    if (typeof buildFavoritesUI === 'function') buildFavoritesUI();
    if (typeof buildWallpaperUI === 'function') buildWallpaperUI();
    if (typeof loadTrack === 'function') loadTrack();
}, 1500);
