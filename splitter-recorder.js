// Автономный студийный рекордер измененных частот стем-микшера
function exportModifiedAudioResult() {
    const audio = document.getElementById('audio');
    const btn = document.getElementById('download-splitter-result-btn');
    if (!audio || !btn || typeof splitterAudioCtx === 'undefined' || !splitterAudioCtx) return;

    btn.textContent = "⏳ ИИ-Запись пакета...";
    btn.style.opacity = "0.6";
    btn.disabled = true;

    // Создаем виртуальный узел назначения для захвата потока
    const streamDest = splitterAudioCtx.createMediaStreamDestination();
    
    // Подключаем финальное звено фильтрации к рекордеру
    if (typeof splitterHighFilter !== 'undefined' && splitterHighFilter) {
        splitterHighFilter.connect(streamDest);
    }

    const mediaRecorder = new MediaRecorder(streamDest.stream);
    const audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        // Конвертируем захваченные байты измененного звука в реальный файл
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        const downloadUrl = URL.createObjectURL(audioBlob);

        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        if (typeof currentSplitterTrack !== 'undefined' && currentSplitterTrack) {
            downloadLink.download = `VibeAI_Edit_${currentSplitterTrack.title}.mp3`;
        } else {
            downloadLink.download = "VibeAI_Modified_Track.mp3";
        }
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Возвращаем кнопку микшера в нормальный вид
        btn.textContent = "📥 Скачать Стемы";
        btn.style.opacity = "1";
        btn.disabled = false;
        
        // Перезапускаем трек с нуля для обычного прослушивания
        audio.currentTime = 0;
        audio.play().catch(() => {});
    };

    // Перематываем песню на старт и активируем циклическую ИИ-запись
    audio.currentTime = 0;
    mediaRecorder.start();
    audio.play().catch(() => {});

    // Записываем ровно 6 секунд стем-аудиолупа
    setTimeout(() => {
        mediaRecorder.stop();
    }, 6000); 
}
