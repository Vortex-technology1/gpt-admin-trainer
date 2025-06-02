import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getRandomScenario() {
  const symptoms = ['кашель', 'температура', 'болі в животі', 'слабкість'];
  const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];
  return `Ти — пацієнт медичного центру. У тебе ${symptom}, ти телефонуєш, щоб записатись. В клініці лікаря немає, але адміністратор має запропонувати рішення. Не здавайся одразу.`;
}

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  const history = req.body.history || [];

  const messages = [
    { role: 'system', content: getRandomScenario() },
    ...history,
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('GPT error');
  }
});

app.listen(3000, () => console.log('GPT тренажер запущено на порту 3000'));