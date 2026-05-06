module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { theme, mode } = req.body;
    if (!theme) return res.status(400).json({ error: 'theme required' });

    const texts = {
        ads: `🔥 Реклама для «${theme}»: уникальное предложение! Только сегодня скидка 50%!`,
        post: `📝 Полезный пост про ${theme}: 5 фактов, которые вас удивят.`,
        sales: `💰 Продающий оффер: ${theme} со скидкой до 30%! Успейте заказать.`,
        idea: `💡 Идея для контента: снимите видео, где ${theme} решает проблему.`,
        motivation: `⚡ Мотивация: ${theme} — ваш первый шаг к успеху. Действуйте!`,
        scripts: `🎬 Сценарий видео (Premium): завязка → конфликт → развязка с ${theme}.`,
        chat: `💬 Готовый скрипт общения: «Здравствуйте! Расскажите о ${theme} подробнее...»`,
        viral: `🔥 Вирусный формат: челлендж #${theme.replace(/\s/g, '')} набирает миллионы.`,
        business: `🏢 B2B оффер: внедрение ${theme} за 3 дня. Оставьте заявку.`
    };
    const text = texts[mode] || texts.ads;
    res.json({ text });
};