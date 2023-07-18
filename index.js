const express = require('express');
const multer = require('multer');
const { NlpManager } = require('@nlpjs/core');
const { LangEn } = require('@nlpjs/lang-en');
const { Similarity } = require('@nlpjs/similarity');

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

const manager = new NlpManager({ languages: [new LangEn()] });
manager.addNamedEntityText(
  'userVoice',
  'file',
  ['en'],
  ['user voice', 'audio'],
  ['audio'],
  {},
  true
);
manager.addNamedEntityText(
  'userText',
  'text',
  ['en'],
  ['user text', 'input'],
  ['input'],
  {},
  true
);

app.use(express.static('public'));

app.post('/upload', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an audio file.' });
  }

  // Save the audio file and return the file path to the client
  res.json({ filePath: req.file.path });
});

app.post('/synthesize', async (req, res) => {
  const { text, filePath } = req.body;
  if (!text || !filePath) {
    return res.status(400).json({ error: 'Please provide the text and audio file path.' });
  }

  try {
    // Perform NLP tasks here (e.g., sentiment analysis, named entity recognition, etc.)

    // For simplicity, we'll just echo back the text as synthesized speech
    res.json({ outputFile: 'synthesized_output.mp3' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
