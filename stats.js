let totalListens = parseInt(localStorage.getItem('vibe_total_plays') || "0", 10);

function recordPlayEvent(trackId) {
    totalListens++;
    localStorage.setItem('vibe_total_plays', totalListens);

    let playData = JSON.parse(localStorage.getItem('vibe_detailed_plays') || "{}");
    playData[trackId] = (playData[trackId] || 0) + 1;
    localStorage.setItem('vibe_detailed_plays', JSON.stringify(playData));

    const currentHour = new Date().getHours();
    let hourlyData = JSON.parse(localStorage.getItem('vibe_hourly_plays') || "{}");
    hourlyData[currentHour] = (hourlyData[currentHour] || 0) + 1;
    localStorage.setItem('vibe_hourly_plays', JSON.stringify(hourlyData));

    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab && activeTab.id === 'tab-stats') {
        buildAdvancedStatsUI();
    }
}

function buildAdvancedStatsUI() {
    const statsTab = document.getElementById('tab-stats');
    if (!statsTab) return;

    let playData = JSON.parse(localStorage.getItem('vibe_detailed_plays') || "{}");
    let hourlyData = JSON.parse(localStorage.getItem('vibe_hourly_plays') || "{}");

    // Вычисляем Дневной/Ночной вайб
    let dayPlays = 0, nightPlays = 0;
    Object.keys(hourlyData).forEach(h => {
        let hour = parseInt(h, 10);
        if (hour >= 6 && hour < 18) dayPlays += hourlyData[h];
        else nightPlays += hourlyData[h];
    });
    let timeVibe = "Вайб не определен";
    if (dayPlays > 0 || nightPlays > 0) {
        timeVibe = dayPlays >= nightPlays ? "☀️ Дневной Меломан" : "🌙 Полуночный Вайбер";
    }

    // Вычисляем текстовый статус меломана
    let userStatus = "Новичок";
    if (totalListens >= 50) userStatus = "👑 Легенда Вайба";
    else if (totalListens >= 15) userStatus = "🎧 Аудио-Зависимый";
    else if (totalListens > 0) userStatus = "🎵 Ценитель Вайба";

    let totalSeconds = 0;
    let loadedCount = 0;
    
    if (tracks.length === 0) {
        if (typeof renderStatsHTML === 'function') {
            renderStatsHTML(statsTab, "0:00", timeVibe, userStatus, playData);
        }
        return;
    }

    tracks.forEach(track => {
        const tempAudio = new Audio(track.audio);
        tempAudio.addEventListener('loadedmetadata', () => {
            totalSeconds += tempAudio.duration;
            loadedCount++;
            if (loadedCount === tracks.length) {
                if (typeof renderStatsHTML === 'function') {
                    renderStatsHTML(statsTab, formatTotalTime(totalSeconds), timeVibe, userStatus, playData);
                }
            }
        });
        tempAudio.addEventListener('error', () => {
            loadedCount++;
            if (loadedCount === tracks.length) {
                if (typeof renderStatsHTML === 'function') {
                    renderStatsHTML(statsTab, formatTotalTime(totalSeconds), timeVibe, userStatus, playData);
                }
            }
        });
    });
}

function formatTotalTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

window.buildAdvancedStatsUI = buildAdvancedStatsUI;

setTimeout(() => {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        if (item.textContent.includes('Статистика')) {
            item.id = 'menu-stats';
            item.addEventListener('click', () => {
                if (typeof switchTab === 'function') switchTab('stats');
            });
        }
    });
}, 1000);
