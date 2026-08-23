/* Вставьте этот блок в самый конец вашего файла style.css */

.track-row, .wallpaper-card-item {
    position: relative;
}

/* Кнопка трех точек */
.more-actions-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
    z-index: 5;
}

.more-actions-btn:hover {
    color: var(--text-main);
    background: rgba(255, 255, 255, 0.05);
}

.more-actions-btn i {
    width: 18px;
    height: 18px;
}

/* Контекстное меню в стиле Telegram (размытый матовый пластик) */
.tg-menu {
    position: fixed;
    display: none;
    background: rgba(23, 23, 30, 0.85);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    min-width: 160px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
    z-index: 9999;
    padding: 6px;
}

.tg-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    color: #e2e2e8;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.15s;
}

.tg-menu-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.tg-menu-item i {
    width: 16px;
    height: 16px;
    color: #a3a3b3;
}

.tg-menu-item.delete {
    color: #ff4d6d;
}

.tg-menu-item.delete i {
    color: #ff4d6d;
}

.tg-menu-item.delete:hover {
    background: rgba(255, 77, 109, 0.1);
}
