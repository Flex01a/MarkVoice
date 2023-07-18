const audioInput = document.getElementById('audioInput');
const textInput = document.getElementById('textInput');
const submitBtn = document.getElementById('submitBtn');
const outputDiv = document.getElementById('output');

let audioBlob;

audioInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('audio/')) {
        alert('Please upload an audio file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        audioBlob = new Blob([reader.result], { type: file.type });
        alert('Voice copied successfully!');
    };
    reader.readAsArrayBuffer(file);
});

submitBtn.addEventListener('click', () => {
    const textToSpeak = textInput.value.trim();
    if (!textToSpeak) {
        alert('Please enter text to generate voice output.');
        return;
    }

    if (!audioBlob) {
        alert('Please upload an audio file first.');
        return;
    }

    // Send the audio and text data to the server
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.wav');
    formData.append('text', textToSpeak);

    fetch('/generate-voice', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.blob())
    .then(voiceBlob => {
        const audioUrl = URL.createObjectURL(voiceBlob);
        const audioElement = new Audio(audioUrl);
        audioElement.controls = true;
        outputDiv.innerHTML = '';
        outputDiv.appendChild(audioElement);
    })
    .catch(error => {
        console.error('Error generating voice:', error);
        alert('An error occurred while generating voice. Please try again.');
    });
});
