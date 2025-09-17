require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

app.get('/latest-spell', (req, res) => {
  res.send({ spell: latestSpell });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Spell server running on port ${PORT}`);
});
