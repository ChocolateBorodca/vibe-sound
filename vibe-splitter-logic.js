// Перехватываем отрисовку Медиатеки, чтобы аккуратно инжектировать кнопку Сплиттера в три точки
function injectSplitterBtnToFavorites() {
    if (typeof buildFavoritesUI === 'function') {
        const originalBuildFavoritesUI = buildFavoritesUI;
        
        window.buildFavoritesUI = function() {
            // Вызываем стандартную рабочую отрисовку Медиатеки
            originalBuildFavoritesUI();
            
            // Пробегаемся по каждой строчке трека в HTML
            tracks.forEach(track => {
                const trackRowElement = document.getElementById(`del-track-${track.id}`);
                if (!trackRowElement) return;

                const buttonParent = trackRowElement.parentElement;
                if (!buttonParent || buttonParent.querySelector(`.splitter-trigger-btn-${track.id}`)) return;

                // Создаем красивую кнопку Сплиттера слева от кнопки Удалить
                const splitterBtn = document.createElement('button');
                splitterBtn.className = `inline-delete-btn splitter-trigger-btn-${track.id}`;
                splitterBtn.id = `split-btn-item-${track.id}`;
                splitterBtn.innerHTML = '✂️ Сплиттер';
                
                // Стилизуем под матовое стекло, гармонирующее с плеером
                splitterBtn.style.cssText = "display: none; background: rgba(0, 245, 255, 0.12); border: 1px solid rgba(0, 245, 255, 0.3); color: #00f5ff; cursor: pointer; padding: 5px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; transition: all 0.2s; margin-right: 4px;";
                
                splitterBtn.addEventListener('mouseover', () => splitterBtn.style.background = 'rgba(0, 245, 255, 0.25)');
                splitterBtn.addEventListener('mouseout', () => splitterBtn.style.background = 'rgba(0, 245, 255, 0.12)');

                // Клик по Сплиттеру открывает наш новый полноэкранный ИИ-модуль
                splitterBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof renderSplitterScreen === 'function') {
                        renderSplitterScreen(track);
                    }
                });

                // Вставляем кнопку Сплиттера строго перед кнопкой Удалить
                buttonParent.insertBefore(splitterBtn, trackRowElement);

                // Расширяем оригинальную функцию toggleDeleteBtn плеера, чтобы Сплиттер вылетал вместе с Удалить
                const moreActionsBtn = buttonParent.querySelector('.more-actions-btn');
                if (moreActionsBtn) {
                    moreActionsBtn.onclick = function(e) {
                        e.stopPropagation();
                        
                        // Прячем все остальные открытые кнопки на сайте
                        document.querySelectorAll('.inline-delete-btn').forEach(btn => {
                            if (btn.id !== `del-track-${track.id}` && btn.id !== `split-btn-item-${track.id}`) {
                                btn.style.display = 'none';
                            }
                        });

                        // Переключаем видимость кнопок текущего трека
                        const delState = trackRowElement.style.display;
                        if (delState === 'block' || delState === 'inline-block') {
                            trackRowElement.style.display = 'none';
                            splitterBtn.style.display = 'none';
                        } else {
                            trackRowElement.style.display = 'inline-block';
                            splitterBtn.style.display = 'inline-block';
                        }
                    };
                }
            });
        };
    }
}

// Запускаем перехват логики кнопок
setTimeout(injectSplitterBtnToFavorites, 2000);
