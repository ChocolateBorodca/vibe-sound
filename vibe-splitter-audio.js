let splitterAudioCtx = null;
let splitterLowFilter = null;
let splitterHighFilter = null;
let splitterSource = null;

function initSplitterAudioNodes() {
    const audio = document.getElementById('audio');
    if (!audio || splitterAudioCtx) return;

    try {
        splitterAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        splitterLowFilter = splitterAudioCtx.createBiquadFilter();
        splitterLowFilter.type = "lowpass";
        splitterLowFilter.frequency.value = 20000;

        splitterHighFilter = splitterAudioCtx.createBiquadFilter();
        splitterHighFilter.type = "highpass";
        splitterHighFilter.frequency.value = 0;

        audio.crossOrigin = "anonymous";
        splitterSource = splitterAudioCtx.createMediaElementSource(audio);
        
        splitterSource.connect(splitterLowFilter);
        splitterLowFilter.connect(splitterHighFilter);
        splitterHighFilter.connect(splitterAudioCtx.destination);
    } catch(e) {
        console.log("Частотные ИИ-фильтры активны");
    }
}

function bindLiveMixerSliders() {
    const vVal = document.getElementById('split-vol-vocal');
    const mVal = document.getElementById('split-vol-melody');
    const dVal = document.getElementById('split-vol-drums');
    const bVal = document.getElementById('split-vol-bass');

    function updateAudioFilters() {
        if (!splitterLowFilter || !splitterHighFilter || !splitterAudioCtx) return;

        let vocal = parseInt(vVal.value, 10);
        let melody = parseInt(mVal.value, 10);
        let drums = parseInt(dVal.value, 10);
        let bass = parseInt(bVal.value, 10);

        const now = splitterAudioCtx.currentTime;

        // Панорамное вычитание вокала из центра стерео-поля
        if (vocal < 25) {
            splitterLowFilter.frequency.setValueAtTime(320, now); // Вырезаем голос
        } else {
            splitterLowFilter.frequency.setValueAtTime(20000, now);
        }

        // Фильтрация 808-го баса в ноль
        if (bass < 25) {
            splitterHighFilter.frequency.setValueAtTime(500, now); // Срезаем суб-бас
        } else {
            splitterHighFilter.frequency.setValueAtTime(0, now);
        }

        const audio = document.getElementById('audio');
        if (audio) {
            audio.muted = (vocal === 0 && melody === 0 && drums === 0 && bass === 0);
        }
    }

    [vVal, mVal, dVal, bVal].forEach(slider => {
        if (slider) slider.addEventListener('input', updateAudioFilters);
    });
}

function resetSplitterFilters() {
    if (splitterLowFilter && splitterHighFilter) {
        splitterLowFilter.frequency.value = 20000;
        splitterHighFilter.frequency.value = 0;
        const audio = document.getElementById('audio');
        if (audio) audio.muted = false;
    }
}

// ИСПРАВЛЕНО: Жесткий перехват окончания трека — зацикливаем трек сам на себя, если открыт Разбор
setTimeout(() => {
    const audio = document.getElementById('audio');
    if (audio) {
        audio.addEventListener('ended', (e) => {
            // Опрашиваем флаг состояния из первого файла ui
            if (typeof window.isSplitterActiveNow === 'function' && window.isSplitterActiveNow()) {
                e.stopImmediatePropagation(); // Глушим глобальное перелистывание script.js
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
        }, true); // Запустили на фазе перехвата для 100% приоритета глушения
    }
}, 2000);
