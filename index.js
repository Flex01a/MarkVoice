const express = require('express');
const multer = require('multer');
const fs = require('fs');
const say = require('say');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/generate-voice', upload.single('audio'), async (req, res) => {
  const { text } = req.body;
  const audioFilePath = req.file.path;

  try {
    // Copy voice from the uploaded audio (using the 'say' package)
    say.export(text, null, 0.5, audioFilePath, async (err) => {
      if (err) {
        console.error('Error copying voice:', err);
        res.status(500).send('An error occurred while copying voice.');
        return;
      }

      // Send the generated audio file back to the client
      res.sendFile(audioFilePath);

      // Clean up the uploaded file
      fs.unlinkSync(audioFilePath);
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
