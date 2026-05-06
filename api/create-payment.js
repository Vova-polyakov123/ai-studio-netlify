const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId required' });

        const shopId = process.env.YOOKASSA_SHOP_ID;
        const secretKey = process.env.YOOKASSA_SECRET_KEY;
        if (!shopId || !secretKey) {
            return res.status(500).json({ error: 'ЮKassa not configured' });
        }

        const paymentData = {
            amount: { value: '149.00', currency: 'RUB' },
            confirmation: { type: 'embedded' },
            capture: true,
            description: 'Premium 30 days',
            metadata: { user_id: String(userId) }
        };

        const response = await axios.post('https://api.yookassa.ru/v3/payments', paymentData, {
            auth: { username: shopId, password: secretKey },
            headers: { 'Idempotence-Key': uuidv4() }
        });

        res.json({ confirmationToken: response.data.confirmation.confirmation_token });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: 'Payment creation failed' });
    }
};