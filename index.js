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

    // Use espeak to generate voice for the given text
    const espeakCommand = `espeak -w ${outputFilePath} "${text}"`;

    exec(espeakCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Error generating voice:', error);
        res.status(500).send('An error occurred while generating voice.');
        return;
      }

      // Use ffmpeg to merge the generated voice with the original audio
      const ffmpegCommand = `ffmpeg -i ${audioFilePath} -i ${outputFilePath} -filter_complex "[0:a]volume=0.5[a];[a][1:a]amerge=inputs=2[aout]" -map "[aout]" ${outputFilePath}`;

      exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
          console.error('Error merging audio:', error);
          res.status(500).send('An error occurred while merging audio.');
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
