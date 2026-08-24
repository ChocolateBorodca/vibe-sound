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

    let dayPlays = 0, nightPlays = 0;
    Object.keys(hourlyData).forEach(h => {
        let hour = parseInt(h, 10);
        if (hour >= 6 && hour < 18) dayPlays += hourlyData[h];
        else nightPlays += hourlyData[h];
    });
    let timeVibe = "Вайб не определен";
    if (dayPlays > 0 || nightPlays > 0) {
        timeVibe = dayPlays >= nightPlays ? "Дневной Меломан" : "Полуночный Вайбер";
    }

    let userStatus = "Новичок";
    if (totalListens >= 50) userStatus = "Легенда Вайба";
    else if (totalListens >= 15) userStatus = "Аудио-Зависимый";
    else if (totalListens > 0) userStatus = "Ценитель Вайба";

    let totalSeconds = 0;
    let loadedCount = 0;
    
    if (tracks.length === 0) {
        renderPureStatsHTML(statsTab, "0:00", timeVibe, userStatus, playData);
        return;
    }

    tracks.forEach(track => {
        const tempAudio = new Audio(track.audio);
        tempAudio.addEventListener('loadedmetadata', () => {
            totalSeconds += tempAudio.duration;
            loadedCount++;
            if (loadedCount === tracks.length) {
                renderPureStatsHTML(statsTab, formatTotalTime(totalSeconds), timeVibe, userStatus, playData);
            }
        });
        tempAudio.addEventListener('error', () => {
            loadedCount++;
            if (loadedCount === tracks.length) {
                renderPureStatsHTML(statsTab, formatTotalTime(totalSeconds), timeVibe, userStatus, playData);
            }
        });
    });
}

function formatTotalTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return min + ":" + (sec < 10 ? "0" : "") + sec;
}

function renderPureStatsHTML(container, totalTime, timeVibe, userStatus, playData) {
    let trackStats = tracks.map(t => {
        return { id: t.id, title: t.title, cover: t.cover, listens: playData[t.id] || 0 };
    });
    trackStats.sort((a, b) => b.listens - a.listens);

    let maxListens = Math.max(...trackStats.map(t => t.listens), 1);

    // Сборка графы прослушиваний через безопасное сложение строк
    let chartBarsHtml = '';
    trackStats.forEach(t => {
        let barHeight = (t.listens / maxListens) * 140;
        if (barHeight < 5 && t.listens > 0) barHeight = 5;
        
        chartBarsHtml += '<div style="display: flex; flex-direction: column; align-items: center; min-width: 70px; gap: 8px;">';
        chartBarsHtml += '<span style="font-size: 11px; font-weight: 600; color: #ff2a74;">' + t.listens + '</span>';
        chartBarsHtml += '<div style="width: 24px; height: 150px; display: flex; align-items: flex-end; background: rgba(255,255,255,0.02); border-radius: 6px;">';
        chartBarsHtml += '<div style="width: 100%; height: ' + barHeight + 'px; background: linear-gradient(to top, #ff2a74, #ff7aa2); border-radius: 6px; box-shadow: 0 0 10px rgba(255, 42, 116, 0.4);"></div>';
        chartBarsHtml += '</div>';
        chartBarsHtml += '<span style="font-size: 10px; color: rgba(255,255,255,0.4); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65px;">' + t.title + '</span>';
        chartBarsHtml += '</div>';
    });

    if (chartBarsHtml === '') {
        chartBarsHtml = '<div style="color: rgba(255,255,255,0.3); font-size: 13px; width: 100%; text-align: center; padding-top: 50px;">Послушайте музыку, чтобы построить граф</div>';
    }

    let topTracksHtml = '';
    let top3 = trackStats.slice(0, 3).filter(t => t.listens > 0);
    if (top3.length === 0) {
        topTracksHtml = '<div style="color: rgba(255,255,255,0.3); font-size: 13px; padding: 10px 0;">Включите треки, чтобы запустить лидерборд</div>';
    } else {
        top3.forEach((t, i) => {
            let imgBg = !t.cover ? 'background: linear-gradient(135deg, #1e1b4b, #0f172a)' : '';
            let imgSrc = t.cover || '';
            
            topTracksHtml += '<div style="display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.04);">';
            topTracksHtml += '<span style="font-weight: 700; color: #ff2a74; font-size: 14px;">#' + (i + 1) + '</span>';
            topTracksHtml += '<img src="' + imgSrc + '" style="width: 32px; height: 32px; border-radius: 6px; object-fit: cover; ' + imgBg + '">';
            topTracksHtml += '<div style="font-size: 13px; font-weight: 500; flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">' + t.title + '</div>';
            topTracksHtml += '<span style="font-size: 11px; color: #ff2a74; background: rgba(255,42,116,0.1); padding: 2px 8px; border-radius: 12px; font-weight: 600;">' + t.listens + ' раз</span>';
            topTracksHtml += '</div>';
        });
    }

    // Собираем и выводим весь готовый интерфейс дашборда на страницу
    let finalHtml = '<div style="max-height: calc(88vh - 150px); overflow-y: auto; padding-right: 6px; display: flex; flex-direction: column; gap: 20px; width:100%;">';
    finalHtml += '<div style="font-size: 13px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Аналитика вашего звука</div>';
    
    finalHtml += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;">';
    finalHtml += '<div class="stats-card"><div class="stats-value">' + tracks.length + '</div><div class="stats-label">Всего песен</div></div>';
    finalHtml += '<div class="stats-card"><div class="stats-value">' + totalTime + '</div><div class="stats-label">Время звучания</div></div>';
    finalHtml += '<div class="stats-card"><div class="stats-value">' + totalListens + '</div><div class="stats-label">Всего запусков</div></div>';
    finalHtml += '<div class="stats-card"><div class="stats-value" style="font-size:13px; font-weight:600; padding-top:10px;">' + timeVibe + '</div><div class="stats-label">Твой тайминг</div></div>';
    finalHtml += '<div class="stats-card"><div class="stats-value" style="font-size:13px; font-weight:600; padding-top:10px;">' + userStatus + '</div><div class="stats-label">Твой статус</div></div>';
    finalHtml += '</div>';

    finalHtml += '<div style="background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 20px; padding: 16px 20px; width: 100%;">';
    finalHtml += '<div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px;">📊 График прослушиваний треков (листайте влево-вправо)</div>';
    finalHtml += '<div class="stats-chart-scroll-area">' + chartBarsHtml + '</div>';
    finalHtml += '</div>';

    finalHtml += '<div style="background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 20px; padding: 20px;">';
    finalHtml += '<div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px;">🏆 Лидеры твоего репита</div>';
    finalHtml += '<div style="display: flex; flex-direction: column; gap: 8px;">' + topTracksHtml + '</div>';
    finalHtml += '</div>';
    
    finalHtml += '</div>';

    container.innerHTML = finalHtml;
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
