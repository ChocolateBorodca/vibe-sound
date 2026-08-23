function initWaveLiveAnimation() {
    const container = document.getElementById('wave-animation-container');
    if (!container) return;

    // Проверяем, создана ли уже наша большая волна, чтобы не дублировать
    let canvas = document.getElementById('wave-visual-canvas');
    if (!canvas) {
        container.innerHTML = ''; // Очищаем старые круги
        canvas = document.createElement('canvas');
        canvas.id = 'wave-visual-canvas';
        
        // Делаем холст широким во весь экран вкладки для панорамной волны
        canvas.width = container.parentElement.clientWidth || 500;
        canvas.height = 260;
        canvas.style.cssText = 'position: absolute; width: 100%; height: 100%; cursor: pointer;';
        container.appendChild(canvas);
        
        // Подгоняем контейнер под широкий формат волны
        container.style.width = '100%';
        container.style.height = '260px';
    }

    const ctx = canvas.getContext('2d');
    let time = 0;

    // Генерируем фиксированные настройки для 12 переплетающихся струн
    const strands = [];
    for (let i = 0; i < 12; i++) {
        strands.push({
            amplitudeFactor: 0.3 + (i * 0.06), // Насколько сильно гнется струна
            frequencyFactor: 0.005 + (i * 0.002), // Плотность витков волны
            speed: 0.02 + (i * 0.005), // Скорость бега волны влево-вправо
            // Подбираем неоновые оттенки: от ярко-розового до фиолетового и белого глянца
            color: i % 3 === 0 ? 'rgba(255, 42, 116, ' : (i % 3 === 1 ? 'rgba(138, 43, 226, ' : 'rgba(255, 255, 255, ')
        });
    }

    function drawStrandWave() {
        if (!document.getElementById('wave-visual-canvas')) return; // Тормозим, если ушли с вкладки
        requestAnimationFrame(drawStrandWave);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let isPlaying = audio && !audio.paused;
        
        // Коэффициент прыжка волны: в тишине она едва дышит, при музыке — взрывается
        let globalPower = isPlaying ? 35 : 3;
        
        // Если активирована Моя Волна и музыка играет, даем максимальный напор басов
        if (typeof isWaveActive !== 'undefined' && isWaveActive && isPlaying) {
            globalPower = 65; 
        }

        const centerY = canvas.height / 2;

        // Отрисовываем каждую нить паутины попиксельно
        strands.forEach((strand, index) => {
            ctx.beginPath();
            ctx.lineWidth = index % 2 === 0 ? 1.5 : 0.8; // Чередуем толщину для объема
            
            // Задаем прозрачность: крайние нити блеклые, центральные — горят неоном
            let alpha = 0.08 + (index * 0.03);
            ctx.strokeStyle = strand.color + alpha + ')';
            
            // Включаем сильное неоновое свечение для белых и розовых нитей
            ctx.shadowBlur = index % 4 === 0 ? 12 : 0;
            ctx.shadowColor = index % 4 === 0 ? '#ff2a74' : 'transparent';

            for (let x = 0; x < canvas.width; x++) {
                // Математическая формула трех синусоид для создания хаотичных переплетений
                let wave1 = Math.sin(x * strand.frequencyFactor + time * strand.speed);
                let wave2 = Math.cos(x * 0.015 - time * 0.02);
                let wave3 = Math.sin(x * 0.003 + time * 0.01) * 1.5;

                // Суммируем волны и умножаем на силу музыки
                let y = centerY + (wave1 * wave2 + wave3) * globalPower * strand.amplitudeFactor;

                // Плавное затухание волны по краям холста (fade out по бокам), как на твоем фото
                let edgeFade = Math.sin((x / canvas.width) * Math.PI);
                y = centerY + (y - centerY) * edgeFade;

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });

        // Скорость течения времени (движения волны)
        time += isPlaying ? 1.2 : 0.2;
    }

    // Запускаем бесконечный цикл рендеринга
    drawStrandWave();
}

// Следим за тем, чтобы холст перестраивался, если контейнер готов
setInterval(initWaveLiveAnimation, 1000);
