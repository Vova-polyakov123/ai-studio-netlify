require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// ========== ВСПОМОГАТЕЛЬНЫЙ ЭНДПОИНТ ДЛЯ ПРЯМОГО ТЕСТА ==========
app.post('/api/create-payment', async (req, res) => {
    console.log('\n========== ЗАПРОС НА ПЛАТЁЖ ==========');
    console.log('Тело запроса:', req.body);
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'userId required' });
    }

    // Берем ключи из окружения (поддерживаем оба варианта)
    const shopId = process.env.YOOMONEY_SHOP_ID || process.env.YOOKASSA_SHOP_ID;
    let secretKey = process.env.YOOMONEY_SECRET_KEY || process.env.YOOKASSA_SECRET_KEY;
    console.log(`🔍 shopId = ${shopId || 'ОТСУТСТВУЕТ'}`);
    console.log(`🔍 secretKey = ${secretKey ? secretKey.substring(0, 10) + '...' : 'ОТСУТСТВУЕТ'}`);
    if (!shopId || !secretKey) {
        return res.status(500).json({ error: 'Ключи не найдены' });
    }

    const idempotenceKey = `${userId}_${Date.now()}`;
    const amount = 149.00;
    const returnUrl = `http://localhost:3000?payment=success`;

    try {
        const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');
        const response = await fetch('https://api.yoomoney.ru/v3/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Idempotence-Key': idempotenceKey,
                'Authorization': `Basic ${auth}`
            },
            body: JSON.stringify({
                amount: { value: amount.toFixed(2), currency: 'RUB' },
                payment_method_data: { type: 'bank_card' },
                confirmation: { type: 'redirect', return_url: returnUrl },
                description: `Premium AI test for ${userId}`,
                metadata: { userId }
            })
        });

        const data = await response.json();
        console.log('📦 Статус ответа:', response.status);
        console.log('📦 Тело ответа ЮMoney:', JSON.stringify(data, null, 2));

        if (response.ok && data.confirmation?.confirmation_url) {
            return res.json({ confirmationUrl: data.confirmation.confirmation_url });
        } else {
            // Возвращаем подробную ошибку клиенту
            return res.status(500).json({
                error: 'Ошибка от ЮMoney',
                status: response.status,
                details: data
            });
        }
    } catch (err) {
        console.error('❌ Исключение:', err);
        return res.status(500).json({ error: err.message });
    }
});

// ========== ОСТАЛЬНЫЕ ЭНДПОИНТЫ ДЛЯ РАБОТЫ ПРИЛОЖЕНИЯ ==========
app.post('/api/generate', (req, res) => {
    const { theme, mode } = req.body;
    res.json({ text: `✨ [${mode.toUpperCase()}] ${theme} – сгенерировано нейросетью.` });
});
app.get('/api/check-premium', (req, res) => res.json({ isPremium: false }));
app.post('/api/activate-premium', (req, res) => res.json({ success: true }));
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
    const shop = process.env.YOOMONEY_SHOP_ID || process.env.YOOKASSA_SHOP_ID;
    if (!shop) console.warn('⚠️ Ключи не заданы');
    else console.log(`💰 Ключи найдены (shopId: ${shop})`);
});