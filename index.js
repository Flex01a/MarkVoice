const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/generate-voice', upload.single('audio'), (req, res) => {
    const { text } = req.body;
    const audioFilePath = req.file.path;
    const outputFilePath = `generated/${Date.now()}_output.wav`;

    const command = `ffmpeg -i ${audioFilePath} -filter:a "volume=0.5" ${outputFilePath}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error copying voice:', error);
            res.status(500).send('An error occurred while copying voice.');
            return;
        }

        const textToSpeechCommand = `espeak-ng -w ${outputFilePath} "${text}"`;
        exec(textToSpeechCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error generating voice:', error);
                res.status(500).send('An error occurred while generating voice.');
                return;
            }

            const audioFile = fs.readFileSync(outputFilePath);
            res.contentType('audio/wav');
            res.send(audioFile);

            // Clean up generated files
            fs.unlinkSync(audioFilePath);
            fs.unlinkSync(outputFilePath);
        });
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
