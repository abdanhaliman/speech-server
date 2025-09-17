require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { AssemblyAI } = require('assemblyai');
const upload = multer({ dest: 'uploads/' });
const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY })

const app = express();
app.use(cors());
app.use(express.json());

let latestSpell = null;

app.post('/spell', (req, res) => {
  const { spell } = req.body;
  if (spell) {
    latestSpell = spell.toLowerCase();
    console.log("Received spell:", latestSpell);
    res.send({ status: "Spell received" });
  } else {
    res.status(400).send({ error: "No spell provided" });
  }
});

// Endpoint baru untuk transkripsi audio
app.post('/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    const audioPath = path.resolve(req.file.path);
    const uploadResponse = await client.files.upload(audioPath);
    const transcript = await client.transcripts.create({
      audio_url: uploadResponse.upload_url,
      language_code: 'id'
    });

    latestSpell = transcript.text.toLowerCase();
    res.send({ spell: latestSpell });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Transcription failed' });
  }
});

app.get('/latest-spell', (req, res) => {
  res.send({ spell: latestSpell });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Spell server running on port ${PORT}`);
});
