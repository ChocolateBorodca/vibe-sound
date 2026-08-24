// Автономный загрузчик треков, обложек и обоев телефона в базу данных
setTimeout(() => {
    const audioInput = document.getElementById('local-audio-input');
    const coverInput = document.getElementById('local-cover-input');
    const bgInput = document.getElementById('local-bg-input');

    if (audioInput) {
        audioInput.addEventListener('change', function(e) {
            if (!e.target.files || e.target.files.length === 0) return;
            const file = e.target.files[0];

            const blobUrl = URL.createObjectURL(file);
            const cleanFileName = file.name.replace(/\.[^/.]+$/, "");

            const newTrack = {
                title: cleanFileName,
                artist: "С телефона",
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
                    if (audio) {
                        audio.play().catch(() => {});
                        if (playIcon) playIcon.setAttribute('data-lucide', 'pause');
                        if (window.lucide) lucide.createIcons();
                    }
                });
            }
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

    // Первоначальный запуск интерфейса после полной прогрузки DOM
    if (typeof buildFavoritesUI === 'function') buildFavoritesUI();
    if (typeof buildWallpaperUI === 'function') buildWallpaperUI();
    if (typeof loadTrack === 'function') loadTrack();
}, 1500);
