// Автономный ежесекундный сканер кнопок три точки
function autoInjectSplitterTrigger() {
    // Находим все открытые в данный момент кнопки удаления на экране
    const deleteButtons = document.querySelectorAll('.inline-delete-btn');
    
    deleteButtons.forEach(delBtn => {
        // Проверяем, что это кнопка удаления именно трека, а не обоев
        if (!delBtn.id || !delBtn.id.startsWith('del-track-')) return;
        
        const trackId = delBtn.id.replace('del-track-', '');
        const parentNode = delBtn.parentElement;
        
        if (!parentNode) return;

        // Если кнопка Сплиттера для этого трека уже создана — ничего не делаем
        if (parentNode.querySelector('.vibe-custom-splitter-btn')) {
            // Синхронизируем видимость Сплиттера с кнопкой Удалить
            const splitterBtn = parentNode.querySelector('.vibe-custom-splitter-btn');
            if (splitterBtn) {
                splitterBtn.style.display = delBtn.style.display;
            }
            return;
        }

        // Создаем новую кнопку Сплиттера строго по твоему маркеру на фото
        const splitterBtn = document.createElement('button');
        splitterBtn.className = 'inline-delete-btn vibe-custom-splitter-btn';
        splitterBtn.innerHTML = '✂️ Сплиттер';
        
        // Матовый неоновый стиль Liquid Glass (Бирюзовый неон)
        splitterBtn.style.cssText = `
            background: rgba(0, 245, 255, 0.12) !important; 
            border: 1px solid rgba(0, 245, 255, 0.3) !important; 
            color: #00f5ff !important; 
            cursor: pointer !important; 
            padding: 5px 12px !important; 
            border-radius: 8px !important; 
            font-size: 13px !important; 
            font-weight: 500 !important; 
            transition: all 0.2s ease !important; 
            margin-right: 6px !important;
            display: ${delBtn.style.display} !important;
        `;

        // Эффекты наведения
        splitterBtn.addEventListener('mouseover', () => splitterBtn.style.background = 'rgba(0, 245, 255, 0.25)');
        splitterBtn.addEventListener('mouseout', () => splitterBtn.style.background = 'rgba(0, 245, 255, 0.12)');

        // Клик по Сплиттеру находит трек в базе и открывает полноэкранный ИИ-микшер
        splitterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof tracks !== 'undefined') {
                const targetTrack = tracks.find(t => t.id == trackId);
                if (targetTrack && typeof renderSplitterScreen === 'function') {
                    renderSplitterScreen(targetTrack);
                } else if (targetTrack) {
                    alert("Сплиттер для трека: " + targetTrack.title + "\n(Файл vibe-splitter-ui.js еще прогружается в память)");
                }
            }
        });

        // Вставляем Сплиттер слева от кнопки Удалить, как на картинке
        parentNode.insertBefore(splitterBtn, delBtn);
    });
}

// Запускаем бесконечный фоновый поток сканирования кликов каждые 300 миллисекунд
setInterval(autoInjectSplitterTrigger, 300);
