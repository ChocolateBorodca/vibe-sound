// Генерация живой пульсирующей неоновой фигуры Яндекса в центре экрана
function initWaveLiveAnimation() {
    const container = document.getElementById('wave-animation-container');
    if (!container || document.getElementById('wave-visual-canvas')) return;

    container.innerHTML = '';
    
    // Создаем холст для плавной 2D-анимации жидкой сферы
    const canvas = document.createElement('canvas');
    canvas.id = 'wave-visual-canvas';
    canvas.width = 240;
    canvas.height = 240;
    canvas.style.position = 'absolute';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let angle = 0;

    function drawAnimation() {
        requestAnimationFrame(drawAnimation);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Получаем громкость из прогресс-бара, если музыка играет
        let isPlaying = audio && !audio.paused;
        let volumeFactor = isPlaying ? 1.0 + Math.sin(angle * 5) * 0.12 : 1.0;
        
        if (typeof isWaveActive !== 'undefined' && isWaveActive && isPlaying) {
            volumeFactor = 1.0 + Math.sin(angle * 8) * 0.25; // Делаем пульсацию мощнее в режиме Волны
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const baseRadius = 65 * volumeFactor;

        // Рисуем внешнее неоновое свечение (жидкое стекло)
        ctx.save();
        let glowGrad = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.3, centerX, centerY, baseRadius * 1.5);
        glowGrad.addColorStop(0, 'rgba(255, 42, 116, 0.2)');
        glowGrad.addColorStop(0.5, 'rgba(138, 43, 226, 0.08)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Рисуем 3 пересекающихся плавающих круга как в Яндекс Музыке
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            let currentAngle = angle + (i * Math.PI / 1.5);
            
            // Смещение центра кругов для эффекта перетекания жидкости
            let offsetX = Math.cos(currentAngle * 2) * (isPlaying ? 12 : 3);
            let offsetY = Math.sin(currentAngle * 1.5) * (isPlaying ? 12 : 3);

            ctx.arc(centerX + offsetX, centerY + offsetY, baseRadius, 0, Math.PI * 2);
            
            ctx.lineWidth = 3;
            if (i === 0) ctx.strokeStyle = '#ff2a74'; // Розовый блик
            else if (i === 1) ctx.strokeStyle = '#8a2be2'; // Фиолетовый блик
            else ctx.strokeStyle = '#00f5ff'; // Бирюзовый блик

            ctx.shadowBlur = 15;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.stroke();
        }

        angle += isPlaying ? 0.03 : 0.008; // Скорость вращения зависит от того, поет ли трек
    }

    drawAnimation();
}

// Запускаем анимацию сразу, как только контейнер появится в разметке
setInterval(initWaveLiveAnimation, 1000);
