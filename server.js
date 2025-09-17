require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AssemblyAI } = require('assemblyai');

const app = express();
const upload = multer({ dest: 'uploads/' });
const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

app.use(cors());
app.use(express.json());

let latestSpell = null;

// 🔮 Manual spell input
app.post('/spell', (req, res) => {
  const { spell } = req.body;
  if (!spell) return res.status(400).send({ error: 'No spell provided' });

  latestSpell = spell.toLowerCase();
  console.log("Manual spell received:", latestSpell);
  res.send({ status: 'Spell received', spell: latestSpell });
});

// 🧙‍♂️ Polling spell from Roblox
app.get('/latest-spell', (req, res) => {
  const spellToSend = latestSpell;
  latestSpell = null; // reset after use
  res.send({ spell: spellToSend });
});

// 🎙️ Upload audio and transcribe via AssemblyAI
app.post('/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    const audioPath = path.resolve(req.file.path);
    const uploadResponse = await client.files.upload(audioPath);
    const transcript = await client.transcripts.create({
      audio_url: uploadResponse.upload_url,
      language_code: 'id' // Bahasa Indonesia
    });

    latestSpell = transcript.text.toLowerCase();
    console.log("Transcribed spell:", latestSpell);
    res.send({ status: 'Spell transcribed', spell: latestSpell });
  } catch (err) {
    console.error("Transcription error:", err);
    res.status(500).send({ error: 'Transcription failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧪 Spell server running on port ${PORT}`);
});
