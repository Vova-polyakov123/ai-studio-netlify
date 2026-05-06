const OpenAI = require('openai');

// Инициализируем OpenAI с ключом из переменных окружения
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async (req, res) => {
    // CORS для предзапроса
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { theme, mode } = req.body;
    if (!theme) {
        return res.status(400).json({ error: 'theme is required' });
    }

    // Проверяем, что ключ задан
    if (!process.env.OPENAI_API_KEY) {
        console.error('OPENAI_API_KEY not set');
        return res.status(500).json({ error: 'OpenAI key not configured' });
    }

    // Промпты под каждый режим – легко менять под свой стиль
    const prompts = {
        ads: `Напиши короткий продающий рекламный текст для VK (до 250 символов) на тему: "${theme}". Используй эмодзи, призыв к действию, восклицания.`,
        post: `Напиши интересный и полезный пост для VK на тему: "${theme}". Длина 200-300 символов. Добавь хештеги.`,
        sales: `Создай продающий оффер (специальное предложение) для товара или услуги "${theme}". Длина до 200 символов. Упомяни выгоду.`,
        idea: `Придумай 3 креативные идеи для контента на тему "${theme}" для VK. Каждая идея – одно предложение.`,
        motivation: `Напиши мотивирующий текст на тему "${theme}" (до 200 символов). Вдохновляющий, энергичный.`,
        scripts: `Напиши короткий сценарий для видео (15 секунд) на тему "${theme}". Формат: 3-4 строки.`,
        chat: `Напиши готовый скрипт ответа менеджера клиенту, который спрашивает про "${theme}". Дружелюбно, с решением.`,
        viral: `Придумай идею для вирусного контента (челлендж или тренд) на тему "${theme}". Опиши в 2-3 предложениях.`,
        business: `Напиши B2B-оффер для компании, которая предлагает "${theme}". Упомяни преимущества, сроки. 200 символов.`,
    };

    const prompt = prompts[mode] || prompts.ads;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',   // можно заменить на 'gpt-4' или 'gpt-4o-mini'
            messages: [
                { role: 'system', content: 'Ты — профессиональный копирайтер для ВКонтакте. Пиши грамотно, ярко, с эмодзи. Не используй markdown.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 400,
            temperature: 0.8,
        });

        const text = completion.choices[0].message.content;
        res.status(200).json({ text });
    } catch (error) {
        console.error('OpenAI error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Generation failed' });
    }
};