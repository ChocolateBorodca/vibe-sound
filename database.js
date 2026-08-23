let db;
const dbRequest = indexedDB.open("MusicPlayerDB", 1);

dbRequest.onupgradeneeded = function(e) {
    db = e.target.result;
    if (!db.objectStoreNames.contains("tracks")) db.createObjectStore("tracks", { keyPath: "id", autoIncrement: true });
    if (!db.objectStoreNames.contains("wallpapers")) db.createObjectStore("wallpapers", { keyPath: "id" });
    if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings");
};

dbRequest.onsuccess = function(e) {
    db = e.target.result;
    loadDataFromStorage();
};

function loadDataFromStorage() {
    const transaction = db.transaction(["tracks", "wallpapers", "settings"], "readonly");
    
    transaction.objectStore("tracks").getAll().onsuccess = function(e) {
        const savedTracks = e.target.result;
        savedTracks.forEach(t => {
            t.audio = URL.createObjectURL(t.audioFile);
            if (t.coverFile) t.cover = URL.createObjectURL(t.coverFile);
            tracks.push(t);
        });
        if (typeof buildFavoritesUI === "function") buildFavoritesUI();
        if (typeof loadTrack === "function") loadTrack();
    };

    transaction.objectStore("wallpapers").getAll().onsuccess = function(e) {
        const savedWps = e.target.result;
        savedWps.forEach(wp => {
            wp.url = URL.createObjectURL(wp.gifFile);
            wallpapers.push(wp);
        });
        if (typeof buildWallpaperUI === "function") buildWallpaperUI();
        
        db.transaction("settings", "readonly").objectStore("settings").get("currentWallpaper").onsuccess = function(e) {
            if (e.target.result) {
                currentWallpaperId = e.target.result;
            }
            if (typeof setWallpaper === "function") setWallpaper(currentWallpaperId);
        };
    };
}

function saveTrackToDB(newTrack, callback) {
    if (!db) return;
    const tx = db.transaction("tracks", "readwrite");
    const request = tx.objectStore("tracks").add(newTrack);
    request.onsuccess = function(e) {
        callback(e.target.result);
    };
}

function updateTrackInDB(currentTrack) {
    if (!db || !currentTrack.id) return;
    const tx = db.transaction("tracks", "readwrite");
    tx.objectStore("tracks").put(currentTrack);
}

function deleteTrackFromDB(id, callback) {
    if (!db) return;
    const tx = db.transaction("tracks", "readwrite");
    tx.objectStore("tracks").delete(id).onsuccess = function() {
        callback();
    };
}

function deleteWallpaperFromDB(id, callback) {
    if (!db) return;
    const tx = db.transaction("wallpapers", "readwrite");
    tx.objectStore("wallpapers").delete(id).onsuccess = function() {
        callback();
    };
}

function saveWallpaperToDB(newWallpaper, callback) {
    if (!db) return;
    const tx = db.transaction("wallpapers", "readwrite");
    const request = tx.objectStore("wallpapers").add(newWallpaper);
    request.onsuccess = function() {
        callback();
    };
}

function saveSettingToDB(key, value) {
    if (!db) return;
    db.transaction("settings", "readwrite").objectStore("settings").put(value, key);
}

function base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareType = urlParams.get('shareType');

    if (!shareType) return;

    window.history.replaceState({}, document.title, window.location.pathname);

    setTimeout(() => {
        if (shareType === 'track') {
            const title = urlParams.get('title') || "Поделились треком";
            const audioBase64 = urlParams.get('audio');
            const coverBase64 = urlParams.get('cover');

            if (!audioBase64) return;

            const audioBlob = base64ToBlob(audioBase64, "audio/mp3");
            const audioFile = new File([audioBlob], `${title}.mp3`, { type: "audio/mp3" });
            
            const newTrack = {
                title: title,
                artist: "Принято по ссылке",
                audio: URL.createObjectURL(audioFile),
                cover: "",
                audioFile: audioFile
            };

            if (coverBase64) {
                const coverBlob = base64ToBlob(coverBase64, "image/jpeg");
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
                alert(`Успешно принят трек: ${title}! Он навсегда сохранен в вашу Медиатеку.`);
            });

        } else if (shareType === 'wp') {
            const wpId = urlParams.get('wpId') || "custom-" + Date.now();
            const urlBase64 = urlParams.get('url');

            if (!urlBase64) return;

            const gifBlob = base64ToBlob(urlBase64, "image/gif");
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
                alert("Успешно приняты новые обои! Они автоматически установлены на фон.");
            });
        }
    }, 1200);
});
