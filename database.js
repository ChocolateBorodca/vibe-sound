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

// Новая функция удаления трека из памяти смартфона
function deleteTrackFromDB(id, callback) {
    if (!db) return;
    const tx = db.transaction("tracks", "readwrite");
    tx.objectStore("tracks").delete(id).onsuccess = function() {
        callback();
    };
}

// Новая функция удаления обоев из памяти смартфона
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
