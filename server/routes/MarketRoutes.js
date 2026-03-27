const express = require('express');
const router = express.Router();
const { analyzeMarket } = require('../controllers/marketController');
const { getPersonalImpact } = require('../controllers/ImpactController');

router.get('/analysis', async (req, res) => {
    try {
        const marketNews = await analyzeMarket();

        const userId = req.query.userId;
        const personalAlerts = await getPersonalImpact(marketNews, userId);

        res.status(200).json({
            marketNews: marketNews || [],
            personalAlerts: personalAlerts || []
        });
    } catch (err) {
        console.error("Route Error:", err);
        res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
});

module.exports = router;