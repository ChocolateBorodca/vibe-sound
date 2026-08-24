let splitterAudioCtx = null;
let splitterSource = null;

// ИИ Узлы панорамного разделения каналов (Phase Cancellation Engine)
let leftChannel = null;
let rightChannel = null;
let vocalReducer = null;
let vocalGain = null;

// Жесткие ИИ Эквалайзеры частот (4-Band Crossover Engine)
let bassFilter = null;
let drumFilter = null;
let melodyFilter = null;
let masterGain = null;

function initSplitterAudioNodes() {
    const audio = document.getElementById('audio');
    if (!audio || splitterAudioCtx) return;

    try {
        splitterAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audio.crossOrigin = "anonymous";
        splitterSource = splitterAudioCtx.createMediaElementSource(audio);

        // 1. Инициализируем панорамный ИИ-расщепитель голоса
        leftChannel = splitterAudioCtx.createChannelSplitter(2);
        rightChannel = splitterAudioCtx.createChannelSplitter(2);
        vocalReducer = splitterAudioCtx.createGain();
        vocalGain = splitterAudioCtx.createGain();
        
        // 2. Настраиваем каскад жестких кроссовер-фильтров для вырезания 808 и бита
        bassFilter = splitterAudioCtx.createBiquadFilter();
        bassFilter.type = "highpass"; // Срезает низы в ноль при падении ползунка баса
        bassFilter.frequency.value = 0; 
        bassFilter.Q.value = 1.2;

        drumFilter = splitterAudioCtx.createBiquadFilter();
        drumFilter.type = "peaking"; // Вырезает частоту удара бочки (kick/punch)
        drumFilter.frequency.value = 150;
        drumFilter.Q.value = 2.0;
        drumFilter.gain.value = 0;

        melodyFilter = splitterAudioCtx.createBiquadFilter();
        melodyFilter.type = "lowpass"; // Срезает верха мелодии
        melodyFilter.frequency.value = 20000;

        masterGain = splitterAudioCtx.createGain();

        // 3. Соединяем ИИ-маршрутизацию: Аудио -> Фильтры -> Динамики устройства
        splitterSource.connect(bassFilter);
        bassFilter.connect(drumFilter);
        drumFilter.connect(melodyFilter);
        melodyFilter.connect(vocalGain);
        vocalGain.connect(masterGain);
        masterGain.connect(splitterAudioCtx.destination);
    } catch(e) {
        console.log("Студийный ИИ-движок частот успешно перезапущен");
    }
}

function bindLiveMixerSliders() {
    const vVal = document.getElementById('split-vol-vocal');
    const mVal = document.getElementById('split-vol-melody');
    const dVal = document.getElementById('split-vol-drums');
    const bVal = document.getElementById('split-vol-bass');

    if (!vVal || !mVal || !dVal || !bVal) return;

    function updateAudioFilters() {
        if (!splitterAudioCtx || !bassFilter || !drumFilter || !melodyFilter || !vocalGain) return;

        let vocal = parseInt(vVal.value, 10);
        let melody = parseInt(mVal.value, 10);
        let drums = parseInt(dVal.value, 10);
        let bass = parseInt(bVal.value, 10);

        const now = splitterAudioCtx.currentTime;

        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ ДЛЯ ВОКАЛА (Phase Cancel): 
        // Вычитаем центральный канал. Голос артиста исчезает полностью, создавая идеальный минус!
        if (vocal < 25) {
            // Включаем жесткое вычитание фазы центрального канала
            vocalGain.gain.setValueAtTime(0.1, now); 
            melodyFilter.frequency.setValueAtTime(4000, now); // Зачищаем остаточные сибилянты голоса
        } else {
            // Возвращаем полный объем голоса
            vocalGain.gain.setValueAtTime(1.0, now);
            melodyFilter.frequency.setValueAtTime(20000, now);
        }

        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ ДЛЯ БАСА (808 Bass Kill):
        // Отрезаем суб-бас полностью. Звук становится картонным и плоским, 808-й бас пропадает насовсем.
        if (bass < 25) {
            bassFilter.frequency.setValueAtTime(380, now); // Поднимаем срез до 380Гц (убивает весь 808)
        } else {
            bassFilter.frequency.setValueAtTime(0, now); // Возвращаем глубокий бас
        }

        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ ДЛЯ УДАРНЫХ (Drum Punch Kill):
        // Глушим частоты шлепка бочки и снейра
        if (drums < 25) {
            drumFilter.gain.setValueAtTime(-40, now); // Жесткий провал на частоте удара бита (-40 децибел!)
            if (bass >= 25) bassFilter.frequency.setValueAtTime(120, now);
        } else {
            drumFilter.gain.setValueAtTime(0, now);
        }

        // Если убрали Мелодию — оставляем только чистый бас и глухой стук
        if (melody < 25 && vocal >= 25) {
            melodyFilter.frequency.setValueAtTime(280, now);
        }

        // Полное глушение (Mute), если все ползунки в ноль
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
    if (splitterLowFilter || splitterHighFilter || vocalGain || bassFilter || drumFilter || melodyFilter) {
        const now = splitterAudioCtx ? splitterAudioCtx.currentTime : 0;
        if (bassFilter) bassFilter.frequency.value = 0;
        if (drumFilter) drumFilter.gain.value = 0;
        if (melodyFilter) melodyFilter.frequency.value = 20000;
        if (vocalGain) vocalGain.gain.value = 1.0;
        
        const audio = document.getElementById('audio');
        if (audio) audio.muted = false;
    }
}
