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
        console.log("Драйвер фильтров уже запущен");
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

        // Если глушим Бас — срезаем низкие частоты (звук становится пищащим)
        if (bass < 30) {
            splitterHighFilter.frequency.setValueAtTime(450, splitterAudioCtx.currentTime);
        } else {
            splitterHighFilter.frequency.setValueAtTime(0, splitterAudioCtx.currentTime);
        }

        // Если глушим Вокал или Мелодию — срезаем высокие частоты (звук уходит под воду)
        if (vocal < 30 || melody < 30) {
            splitterLowFilter.frequency.setValueAtTime(320, splitterAudioCtx.currentTime);
        } else {
            splitterLowFilter.frequency.setValueAtTime(20000, splitterAudioCtx.currentTime);
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
