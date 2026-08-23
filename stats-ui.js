function renderStatsHTML(container, totalTime, timeVibe, userStatus, playData) {
    let trackStats = tracks.map(t => {
        return { id: t.id, title: t.title, cover: t.cover, listens: playData[t.id] || 0 };
    });
    trackStats.sort((a, b) => b.listens - a.listens);

    let maxListens = Math.max(...trackStats.map(t => t.listens), 1);

    let chartBarsHtml = '';
    trackStats.forEach(t => {
        let barHeight = (t.listens / maxListens) * 140;
        if (barHeight < 5 && t.listens > 0) barHeight = 5;
        
        chartBarsHtml += `
            <div style="display: flex; flex-direction: column; align-items: center; min-width: 70px; gap: 8px;">
                <span style="font-size: 11px; font-weight: 600; color: #ff2a74;">${t.listens}</span>
                <div style="width: 24px; height: 150px; display: flex; align-items: flex-end; background: rgba(255,255,255,0.02); border-radius: 6px;">
                    <div style="width: 100%; height: ${barHeight}px; background: linear-gradient(to top, #ff2a74, #ff7aa2); border-radius: 6px; box-shadow: 0 0 10px rgba(255, 42, 116, 0.4);"></div>
                </div>
                <span style="font-size: 10px; color: rgba(255,255,255,0.4); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65px;" title="${t.title}">${t.title}</span>
            </div>
        `;
    });

    if (chartBarsHtml === '') {
        chartBarsHtml = '<div style="color: rgba(255,255,255,0.3); font-size: 13px; width: 100%; text-align: center; padding-top: 50px;">Загрузите и послушайте музыку, чтобы построить граф</div>';
    }

    let topTracksHtml = '';
    let top3 = trackStats.slice(0, 3).filter(t => t.listens > 0);
    if (top3.length === 0) {
        topTracksHtml = '<div style="color: rgba(255,255,255,0.3); font-size: 13px; padding: 10px 0;">Включите треки, чтобы запустить лидерборд</div>';
    } else {
        top3.forEach((t, i) => {
            const imgBg = !t.cover ? 'background: linear-gradient(135deg, #1e1b4b, #0f172a)' : '';
            topTracksHtml += `
                <div style="display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.04);">
                    <span style="font-weight: 700; color: #ff2a74; font-size: 14px;">#${i+1}</span>
                    <img src="${t.cover || ''}" style="width: 32px; height: 32px; border-radius: 6px; object-fit: cover; ${imgBg}">
                    <span style="font-size: 13px; font-weight: 500; flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">${t.title}</span>
                    <span style="font-size: 11px; color: #ff2a74; background: rgba(255,42,116,0.1); padding: 2px 8px; border-radius: 12px; font-weight: 600;">${t.listens} раз</span>
                </div>
            `;
        });
    }

    container.innerHTML = `
        <div style="max-height: calc(88vh - 150px); overflow-y: auto; padding-right: 6px; display: flex; flex-direction: column; gap: 20px;">
            <div style="font-size: 13px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Аналитика вашего звука</div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;">
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px; text-align: center; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                    <div style="font-size: 24px; font-weight: 700; color: #ff2a74; margin-bottom: 2px;">${tracks.length}</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Всего песен</div>
                </div>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px; text-align: center; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                    <div style="font-size: 24px; font-weight: 700; color: #ff2a74; margin-bottom: 2px;">${totalTime}</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Время звучания</div>
                </div>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px; text-align: center; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                    <div style="font-size: 24px; font-weight: 700; color: #ff2a74; margin-bottom: 2px;">${totalListens}</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Всего запусков</div>
                </div>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px; text-align: center; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                    <div style="font-size: 13px; font-weight: 600; color: #ffffff; padding-top: 10px; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${timeVibe}</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Твой тайминг</div>
                </div>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px; text-align: center; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
                    <div style="font-size: 13px; font-weight: 600; color: #ffffff; padding-top: 10px; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${userStatus}</div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px;">Твой статус</div>
                </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 20px; padding: 16px 20px; width: 100%;">
                <div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px;">📊 График прослушиваний треков (листайте влево-вправо)</div>
                <div class="stats-chart-scroll-area">
                    ${chartBarsHtml}
                </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 20px; padding: 20px;">
                <div style="font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px;">🏆 Лидеры твоего репита</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${topTracksHtml}
                </div>
            </div>
        </div>
    `;
}
