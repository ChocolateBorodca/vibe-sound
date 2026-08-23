// Ловим глобальные запуски треков через перехват кнопки Play
setTimeout(() => {
    const mainPlayBtn = document.getElementById('play');
    if (!mainPlayBtn) return;

    mainPlayBtn.addEventListener('click', () => {
        if (!audio.paused && tracks[currentIndex]) {
            const trackId = tracks[currentIndex].id;
            
            // Накручиваем счетчики в память устройства
            let total = parseInt(localStorage.getItem('vibe_total_plays') || "0", 10) + 1;
            localStorage.setItem('vibe_total_plays', total);

            let playData = JSON.parse(localStorage.getItem('vibe_detailed_plays') || "{}");
            playData[trackId] = (playData[trackId] || 0) + 1;
            localStorage.setItem('vibe_detailed_plays', JSON.stringify(playData));

            const currentHour = new Date().getHours();
            let hourlyData = JSON.parse(localStorage.getItem('vibe_hourly_plays') || "{}");
            hourlyData[currentHour] = (hourlyData[currentHour] || 0) + 1;
            localStorage.setItem('vibe_hourly_plays', JSON.stringify(hourlyData));

            // Если открыта статистика — сразу перерисовываем
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab && activeTab.id === 'tab-stats' && typeof buildAdvancedStatsUI === 'function') {
                buildAdvancedStatsUI();
            }
        }
    });
}, 1500);
