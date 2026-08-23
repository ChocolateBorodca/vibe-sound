let isWaveActive = false;
let activeWaveGenre = null;

function initVibeWaveMap() {
    const waveTabSection = document.getElementById('tab-wave');
    if (!waveTabSection) return;

    waveTabSection.innerHTML = '';
    waveTabSection.style.cssText = 'padding: 30px 40px; height: calc(88vh - 180px); display: flex; align-items: center; justify-content: center; position: relative; width: 100%;';

    const mapWrapper = document.createElement('div');
    mapWrapper.id = 'vibe-map-wrapper';
    mapWrapper.style.cssText = 'position: relative; width: 450px; height: 450px; display: flex; align-items: center; justify-content: center;';

    const centerBtn = document.createElement('button');
    centerBtn.id = 'vibe-center-wave-btn';
    centerBtn.innerHTML = isWaveActive ? '🛑<br>Выключить' : '🌊<br>Моя Волна';
    
    const centerBg = isWaveActive ? '#ff4d6d' : '#ff2a74';
    centerBtn.style.cssText = `position: absolute; z-index: 50; width: 110px; height: 110px; background: ${centerBg}; border: 2px solid ${centerBg}; color: #ffffff; font-size: 14px; font-weight: 700; border-radius: 50%; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 30px ${centerBg}99; text-align: center; line-height: 1.3;`;
    
    centerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof tracks === 'undefined' || tracks.length === 0) {
            alert("Загрузите треки во вкладке Любимое!");
            return;
        }

        isWaveActive = !isWaveActive;
        
        if (isWaveActive) {
            activeWaveGenre = "mix";
            currentIndex = Math.floor(Math.random() * tracks.length);
            if (typeof startWavePlayback === 'function') startWavePlayback();
            initVibeWaveMap(); 
        } else {
            activeWaveGenre = null;
            const audio = document.getElementById('audio');
            if (audio) audio.pause();
            const playIcon = document.getElementById('play-icon');
            if (playIcon) playIcon.setAttribute('data-lucide', 'play');
            if (window.lucide) lucide.createIcons();
            initVibeWaveMap(); 
        }
    });
    mapWrapper.appendChild(centerBtn);

    if (!isWaveActive) {
        waveTabSection.appendChild(mapWrapper);
        return;
    }

    let uniqueGenres = [];
    if (typeof tracks !== 'undefined') {
        tracks.forEach(track => {
            if (track.genre) {
                let cleanG = track.genre.trim();
                if (cleanG && !uniqueGenres.includes(cleanG)) uniqueGenres.push(cleanG);
            }
        });
    }

    let smartButtons = [];
    if (typeof tracks !== 'undefined' && tracks.length > 0) {
        smartButtons.push({ name: "✨ Новинки", type: "new" });
    }
    let playData = JSON.parse(localStorage.getItem('vibe_detailed_plays') || "{}");
    let hasPlays = Object.values(playData).some(v => v > 0);
    if (hasPlays) {
        smartButtons.push({ name: "🔥 Популярное", type: "popular" });
    }

    let allNodes = [...smartButtons.map(b => ({ name: b.name, type: b.type, isSmart: true }))];
    uniqueGenres.forEach(g => allNodes.push({ name: g, isSmart: false }));

    const radius = 160;
    const totalNodes = allNodes.length;

    allNodes.forEach((node, index) => {
        const angle = (index * 2 * Math.PI) / totalNodes - (Math.PI / 2);
        const x = Math.cos(angle) * radius + 225 - 65; 
        const y = Math.sin(angle) * radius + 225 - 20;

        const btn = document.createElement('button');
        btn.className = 'vibe-orbit-node-btn';
        btn.innerHTML = node.name;
        
        const isCurrentActive = (activeWaveGenre === node.name.toLowerCase().trim()) || (node.isSmart && activeWaveGenre === node.type);

        if (isCurrentActive) {
            btn.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; width: 130px; height: 40px; background: rgba(0, 245, 255, 0.25); border: 2px solid #00f5ff; color: #00f5ff; font-size: 12px; font-weight: 700; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; z-index: 10; text-shadow: 0 0 10px rgba(0, 245, 255, 0.6); box-shadow: 0 0 20px rgba(0, 245, 255, 0.4); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);`;
        } else if (node.isSmart) {
            btn.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; width: 130px; height: 40px; background: rgba(0, 245, 255, 0.1); border: 1px solid rgba(0, 245, 255, 0.3); color: #00f5ff; font-size: 12px; font-weight: 600; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; z-index: 10; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);`;
        } else {
            btn.style.cssText = `position: absolute; left: ${x}px; top: ${y}px; width: 130px; height: 40px; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.15); color: #ffffff; font-size: 12px; font-weight: 500; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; z-index: 10; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);`;
        }

        if (!isCurrentActive) {
            btn.addEventListener('mouseover', () => {
                btn.style.borderColor = '#ff2a74';
                btn.style.color = '#ff2a74';
                btn.style.boxShadow = '0 0 15px rgba(255, 42, 116, 0.4)';
            });
            btn.addEventListener('mouseout', () => {
                if (node.isSmart) {
                    btn.style.borderColor = 'rgba(0, 245, 255, 0.3)';
                    btn.style.color = '#00f5ff';
                } else {
                    btn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    btn.style.color = '#ffffff';
                }
                btn.style.boxShadow = 'none';
            });
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof tracks === 'undefined' || tracks.length === 0) return;

            if (node.isSmart) {
                activeWaveGenre = node.type;
                if (node.type === "new") currentIndex = tracks.length - 1;
                else if (node.type === "popular") {
                    let maxCount = -1, popularIdx = 0;
                    tracks.forEach((t, i) => {
                        let count = playData[t.id] || 0;
                        if (count > maxCount) { maxCount = count; popularIdx = i; }
                    });
                    currentIndex = popularIdx;
                }
                if (typeof startWavePlayback === 'function') startWavePlayback();
                initVibeWaveMap(); 
            } else {
                let cleanName = node.name.toLowerCase().trim();
                let genrePool = tracks.filter(t => t.genre && t.genre.toLowerCase().trim() === cleanName);
                if (genrePool.length > 0) {
                    activeWaveGenre = cleanName;
                    const randomTrack = genrePool[Math.floor(Math.random() * genrePool.length)];
                    currentIndex = tracks.findIndex(t => t.id === randomTrack.id);
                    if (typeof startWavePlayback === 'function') startWavePlayback();
                    initVibeWaveMap(); 
                }
            }
        });

        mapWrapper.appendChild(btn);
    });

    waveTabSection.appendChild(mapWrapper);
}
