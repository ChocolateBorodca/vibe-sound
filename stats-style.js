// Автоматически внедряем стили для прокрутки и свайпа графы, не меняя style.css
const styleElement = document.createElement('style');
styleElement.textContent = `
    .stats-chart-scroll-area {
        display: flex !important;
        gap: 24px !important;
        padding: 10px 10px 20px 10px !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        scrollbar-width: thin !important;
        scrollbar-color: rgba(255, 42, 116, 0.3) transparent !important;
        -webkit-overflow-scrolling: touch !important;
        cursor: grab !important;
    }

    .stats-chart-scroll-area:active {
        cursor: grabbing !important;
    }

    .stats-chart-scroll-area::-webkit-scrollbar {
        height: 4px !important;
    }

    .stats-chart-scroll-area::-webkit-scrollbar-thumb {
        background-color: rgba(255, 42, 116, 0.3) !important;
        border-radius: 4px !important;
    }
`;
document.head.appendChild(styleElement);
