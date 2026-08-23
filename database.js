// ВСТАВЬТЕ ЭТОТ ОБНОВЛЕННЫЙ БЛОК В САМЫЙ КОНЕЦ ФАЙЛА database.js ВМЕСТО СТАРЫХ СТРОК С SHARE

// Автоматический перехват короткой интернет-ссылки при запуске плеера другом
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareType = urlParams.get('shareType');

    if (!shareType) return;

    window.history.replaceState({}, document.title, window.location.pathname);

    setTimeout(async () => {
        try {
            if (shareType === 'track') {
                const title = urlParams.get('title') || "Принятый трек";
                const audioUrl = urlParams.get('audioUrl');
                const coverUrl = urlParams.get('coverUrl');

                if (!audioUrl) return;

                // Скачиваем аудиофайл по короткой ссылке с Vercel Blob
                const audioRes = await fetch(audioUrl);
                const audioBlob = await audioRes.blob();
                const audioFile = new File([audioBlob], `${title}.mp3`, { type: "audio/mp3" });
                
                const newTrack = {
                    title: title,
                    artist: "Добавлено по ссылке",
                    audio: URL.createObjectURL(audioFile),
                    cover: "",
                    audioFile: audioFile
                };

                if (coverUrl) {
                    const coverRes = await fetch(coverUrl);
                    const coverBlob = await coverRes.blob();
                    const coverFile = new File([coverBlob], "cover.jpg", { type: "image/jpeg" });
                    newTrack.cover = URL.createObjectURL(coverFile);
                    newTrack.coverFile = coverFile;
                }

                saveTrackToDB(newTrack, function(insertedId) {
                    newTrack.id = insertedId;
                    tracks.push(newTrack);
                    if (typeof buildFavoritesUI === "function") buildFavoritesUI();
                    currentIndex = tracks.length - 1;
                    if (typeof loadTrack === "function") loadTrack();
                    alert(`Успешно принят трек: ${title}! Он сохранен в вашу медиатеку.`);
                });

            } else if (shareType === 'wp') {
                const wpId = urlParams.get('wpId') || "custom-" + Date.now();
                const url = urlParams.get('url');

                if (!url) return;

                // Скачиваем GIF обоев по короткой ссылке с Vercel Blob
                const wpRes = await fetch(url);
                const gifBlob = await wpRes.blob();
                const gifFile = new File([gifBlob], "wallpaper.gif", { type: "image/gif" });

                const newWallpaper = {
                    id: wpId,
                    name: "Принятые обои",
                    url: URL.createObjectURL(gifFile),
                    gifFile: gifFile
                };

                saveWallpaperToDB(newWallpaper, function() {
                    wallpapers.push(newWallpaper);
                    if (typeof buildWallpaperUI === "function") buildWallpaperUI();
                    if (typeof setWallpaper === "function") setWallpaper(wpId);
                    alert("Успешно приняты новые живые обои!");
                });
            }
        } catch (err) {
            alert("Не удалось автоматически установить файл по ссылке.");
        }
    }, 1200);
});
