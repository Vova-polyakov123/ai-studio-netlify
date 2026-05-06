const premiumStore = new Map();

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).end();

    const event = req.body;
    if (event.object?.status === 'succeeded') {
        const userId = event.object.metadata.user_id;
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
        premiumStore.set(userId, { isPremium: true, expiresAt });
        console.log(`✅ Premium activated for user ${userId}`);
        res.status(200).send('OK');
    } else {
        res.status(200).send('Ignored');
    }
};

module.exports.premiumStore = premiumStore;