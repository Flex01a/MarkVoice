const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/generate-voice', upload.single('audio'), async (req, res) => {
  const { text } = req.body;
  const audioFilePath = req.file.path;

  try {
    const outputFilePath = `generated/${Date.now()}_output.wav`;

    // Use ffmpeg to lower the volume of the original audio
    const ffmpegCommand = `ffmpeg -i ${audioFilePath} -filter:a "volume=0.5" ${outputFilePath}`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Error copying voice:', error);
        res.status(500).send('An error occurred while copying voice.');
        return;
      }

      // Use ffmpeg to add text-to-speech voice to the audio
      const textToSpeechCommand = `ffmpeg -i ${outputFilePath} -vf "drawtext=text='${text}':fontsize=24:fontcolor=white:x=10:y=10" ${outputFilePath}`;

      exec(textToSpeechCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('Error generating voice:', error);
          res.status(500).send('An error occurred while generating voice.');
          return;
        }

        // Send the generated audio file back to the client
        res.sendFile(outputFilePath);

        // Clean up uploaded and generated files
        fs.unlinkSync(audioFilePath);
        fs.unlinkSync(outputFilePath);
      });
    });
  } catch (error) {
    console.error('Error generating voice:', error);
    res.status(500).send('An error occurred while generating voice.');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
