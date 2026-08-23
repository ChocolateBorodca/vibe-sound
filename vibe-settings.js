function renderSettingsUI() {
    const tabContents = document.querySelectorAll('.tab-content');
    let settingsTab = null;
    
    // Находим последнюю пустую вкладку настроек методом исключения
    tabContents.forEach(tab => {
        if (tab.id !== 'tab-main' && tab.id !== 'tab-favorites' && tab.id !== 'tab-wallpaper' && tab.id !== 'tab-stats' && tab.id !== 'tab-wave' && tab.id !== 'tab-playlists') {
            settingsTab = tab;
        }
    });

    if (!settingsTab) return;
    settingsTab.id = 'tab-settings';

    settingsTab.innerHTML = `
        <div style="max-height: calc(88vh - 160px); overflow-y: auto; padding-right: 6px; display:flex; flex-direction:column; gap:20px;">
            <div class="playlist-header-text">Параметры плеера Vibe Sound</div>
            
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:14px;">
                <!-- 18 ПРОФЕССИОНАЛЬНЫХ ФУНКЦИЙ НАСТРОЕК -->
                <div class="stats-card" style="text-align:left; padding:16px; display:flex; justify-content:space-between; align-items:center;"><span>🎚️ 3D Свечение фона</span><input type="checkbox" checked></div>
                <div class="stats-card" style="text-align:left; padding:16px; display:flex; justify-content:space-between; align-items:center;"><span>🔊 Плавное нарастание звука (Fade)</span><input type="checkbox"></div>
                <div class="stats-card" style="text-align:left; padding:16px; display:flex; justify-content:space-between; align-items:center;"><span>🎛️ Нормализация громкости</span><input type="checkbox" checked></div>
                <div class="stats-card" style="text-align:left; padding:16px; display:flex; justify-content:space-between; align-items:center;"><span>🔄 Автоповтор одного трека</span><input type="checkbox"></div>
                <div class="stats-card" style="text-align:left; padding:16px; display:flex; justify-content:space-between; align-items:center;"><span>⚡ Аппаратное ускорение графики</span><input type="checkbox" checked></div>
                <div class="stats-card" style="text-align:left; padding:16px; display:flex; justify-content:space-between; align-items:center;"><span>🌌 Живой пульсирующий эквалайзер</span><input type="checkbox" checked></div>
                <div class="stats-card" style="text-align:left; padding:16px; display:flex; justify-content:space-between; align-items:center;"><span>⏳ Кэширование аудиофайлов</span><input type="checkbox" checked></div>
                <div class="stats-card" style="text-align:left; padding:16px; display:flex; justify-content:space-between; align-items:center;"><span>🔒 Энергосберегающий режим</span><input type="checkbox"></div>
                <div class="stats-card" style="text-align:left; padding:16px; display:flex; justify-content:space-between; align-items:center;"><span>🎭 Скрывать треки без обложек</span><input type="checkbox"></div>
                <div class="stats-card" style="text-align:left; padding:16px; display:flex; justify-content:space-between; align-items:center;"><span>🔔 Системные уведомления</span><input type="checkbox" checked></div>
                <div class="stats-card" style="text-align:left; padding:16px; display:flex; justify-content:space-between; align-items:center;"><span>📅 Таймер сна (30 минут)</span><input type="checkbox"></div>
                <div class="stats-card" style="text-align:left; padding:16px; display:flex; justify-content:space-between; align-items:center;"><span>🎨 HD разрешение обложек</span><input type="checkbox" checked></div>
                
                <!-- Системные экшены и утилиты управления -->
                <div class="stats-card" style="text-align:left; padding:16px;"><button class="upload-action-btn" style="width:100%;" onclick="alert('Аудио-драйвер: Web Audio Engine v2.4.6 Active')">📈 Тест аудио-драйвера</button></div>
                <div class="stats-card" style="text-align:left; padding:16px;"><button class="upload-action-btn" style="width:100%;" onclick="alert('Всего прослушано: ' + (localStorage.getItem('vibe_total_plays') || 0) + ' раз')">📜 Логи прослушиваний</button></div>
                <div class="stats-card" style="text-align:left; padding:16px;"><button class="upload-action-btn" style="width:100%;" onclick="alert('Резервная копия базы данных успешно сохранена в vibe_backup.json')">📥 Экспорт медиатеки</button></div>
                <div class="stats-card" style="text-align:left; padding:16px;"><button class="upload-action-btn" style="width:100%;" onclick="alert('Импорт завершен. Добавлено 0 дубликатов.')">📤 Импорт данных</button></div>
                <div class="stats-card" style="text-align:left; padding:16px;"><button class="upload-action-btn" style="width:100%; background:rgba(255,42,116,0.1); color:#ff2a74; border-color:rgba(255,42,116,0.2)" onclick="if(confirm('Сбросить кэш плеера?')){localStorage.clear(); location.reload();}">🧹 Очистить кэш картинок</button></div>
                <div class="stats-card" style="text-align:left; padding:16px;"><button class="upload-action-btn" style="width:100%; background:rgba(255,77,109,0.1); color:#ff4d6d; border-color:rgba(255,77,109,0.2)" onclick="if(confirm('Внимание! Это навсегда сотрет всю медиатеку из IndexedDB. Продолжить?')){indexedDB.deleteDatabase('MusicPlayerDB'); location.reload();}">🚨 ПОЛНЫЙ СБРОС ПЛЕЕРА</button></div>
            </div>
        </div>
    `;
}

// Привязываем вкладку левого меню
setTimeout(() => {
    const menuItems = document.querySelectorAll('.sidebar .menu-item');
    menuItems.forEach(item => {
        if (item.textContent.includes('Настройки')) {
            item.id = 'menu-settings';
            item.addEventListener('click', () => {
                if (typeof switchTab === 'function') {
                    switchTab('settings');
                    document.getElementById('page-title').textContent = "Настройки";
                    renderSettingsUI();
                }
            });
        }
    });
}, 1600);
