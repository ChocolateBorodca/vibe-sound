/**
 * Изолированный скрипт анимации «Моей волны» в стиле Яндекс Музыки
 * Автоматически встраивается в элемент с id="wave-container"
 */
(function () {
    // 1. Создаем Canvas и добавляем его в контейнер
    const container = document.getElementById('wave-container');
    if (!container) {
        console.error('Элемент #wave-container не найден!');
        return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // Стилизуем canvas, чтобы он занимал все пространство родителя
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';

    // Функция подгонки разрешения под реальные размеры с учетом Retina-экранов
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
    }
    
    window.addEventListener('resize', resize);
    resize();

    // 2. Настройки анимации волн
    let phase = 0;
    
    // Параметры для 3-х слоев волн (можно менять для кастомизации)
    const waves = [
        { 
            amplitude: 45,  // Высота волны в пикселях
            frequency: 0.008, // Плотность волн (чем меньше, тем шире волна)
            speed: 0.02,    // Скорость движения
            color: 'rgba(255, 40, 100, 0.4)', // Розово-красный
            lineWidth: 4
        },
        { 
            amplitude: 30, 
            frequency: 0.012, 
            speed: -0.015,  // Отрицательная скорость — волна идет в другую сторону
            color: 'rgba(140, 40, 255, 0.5)', // Фиолетовый
            lineWidth: 3
        },
        { 
            amplitude: 20, 
            frequency: 0.018, 
            speed: 0.025, 
            color: 'rgba(0, 230, 255, 0.3)',  // Бирюзовый
            lineWidth: 2
        }
    ];

    // 3. Главный цикл анимации
    function animate() {
        requestAnimationFrame(animate);

        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        const centerY = height / 2;

        // Очищаем холст перед каждым кадром
        ctx.clearRect(0, 0, width, height);

        // Используем режим наложения цветов для красивого эффекта свечения на стыках
        ctx.globalCompositeOperation = 'screen';

        // Рисуем каждую волну из массива
        waves.forEach((wave) => {
            ctx.beginPath();
            ctx.lineWidth = wave.lineWidth;
            ctx.strokeStyle = wave.color;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Двигаем фазу конкретной волны с ее собственной скоростью
            wave.currentPhase = (wave.currentPhase || 0) + wave.speed;

            let x = 0;
            let y = centerY + Math.sin(x * wave.frequency + wave.currentPhase) * wave.amplitude;
            ctx.moveTo(x, y);

            // Шаг отрисовки в пикселях (чем меньше шаг, тем плавнее линии)
            const step = 5; 

            for (let i = step; i <= width; i += step) {
                const nextX = i;
                // Математическая магия синуса для создания живой кривой
                const nextY = centerY + Math.sin(nextX * wave.frequency + wave.currentPhase) * wave.amplitude;
                
                // Сглаживание через вычисление средней точки (эффект кривых Безье)
                const xc = (x + nextX) / 2;
                const yc = (y + nextY) / 2;
                
                ctx.quadraticCurveTo(x, y, xc, yc);
                
                x = nextX;
                y = nextY;
            }

            ctx.lineTo(x, y);
            ctx.stroke();
        });
    }

    // Запускаем бесконечный цикл
    animate();
})();
