const crypto = require('crypto');
const { premiumStore } = require('./webhook.js');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { vk_user_id, sign, ...params } = req.query;
    if (!vk_user_id || !sign) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const appSecret = process.env.APP_SECRET;
    if (!appSecret) {
        console.error('APP_SECRET not set');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // Собираем все параметры кроме sign, сортируем
    const queryParams = { ...params, vk_user_id };
    const sortedKeys = Object.keys(queryParams).sort();
    const paramString = sortedKeys.map(key => `${key}=${queryParams[key]}`).join('&');

    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(paramString);
    const expectedSign = hmac.digest('hex');

    if (sign !== expectedSign) {
        return res.status(403).json({ error: 'Invalid signature' });
    }

    const record = premiumStore.get(vk_user_id);
    const isPremium = record && record.isPremium && record.expiresAt > Date.now();
    if (record && record.expiresAt <= Date.now()) premiumStore.delete(vk_user_id);

    res.json({ isPremium: !!isPremium });
};