
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are Ms. Vanessa, a smart and loyal assistant." },
        { role: "user", content: message }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Ms. Vanessa had trouble responding.' });
  }
});

app.listen(PORT, () => {
  console.log(`Ms. Vanessa backend running on http://localhost:${PORT}`);
});
