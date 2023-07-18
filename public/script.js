<!-- Add this script tag at the end of the index.html file -->
<script>
  document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const audioFile = formData.get('audio');
    const text = formData.get('text');

    if (!audioFile || !text) {
      alert('Please upload an audio file and enter text.');
      return;
    }

    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();

    const synthResponse = await fetch('/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, filePath: data.filePath }),
    });
    const synthData = await synthResponse.json();

    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = synthData.outputFile;
    audioPlayer.play();
  });
</script>
