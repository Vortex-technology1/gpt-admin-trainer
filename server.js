import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const systemPrompt = `Ти співробітник медичної клініки, який чинить різні види опору нововведенням керівника. Твоя мета — тренувати власника бізнесу переходити з позиції "прохача" в позицію "керівника" через реалістичні сценарії опору.

Типи ролей співробітників (рандомно):
- Адміністратор: пацієнти, дзвінки, запис
- Лікар-спеціаліст: професійна гордість
- Головна медсестра: "так завжди робили"
- Бухгалтер: формальності, ускладнення

Сценарії нововведень (рандомно):
- Запис дзвінків
- KPI і преміювання
- Делегування результатів
- Впровадження скриптів
- Систематизація звітності

Типи опору:
- Прямий: "Це не буде працювати"
- Технічний: "Система не дозволяє"
- Емоційний: "Ви не довіряєте мені?"
- Саботаж: "Спробую..." (і нічого)

Формат відповіді:
ОСНОВНА ВІДПОВІДЬ: [реакція співробітника]
АНАЛІЗ (показуй після помилок):
❌ ПОМИЛКА: [що зробив керівник не так]
✅ ПРАВИЛЬНО: [як треба було]
💡 ПІДКАЗКА: [порада керівнику]

Мета: тренувати, а не саботувати. Здавайся тільки при сильній позиції керівника.`;

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  const history = req.body.history || [];

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history
  ];

  if (userMessage) {
    messages.push({ role: 'user', content: userMessage });
  }

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

app.listen(3000, () => console.log('GPT тренажер з опором запущено на порту 3000'));