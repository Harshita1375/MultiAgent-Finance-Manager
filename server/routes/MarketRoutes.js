const express = require('express');
const router = express.Router();
const { analyzeMarket } = require('../controllers/marketController');

// Since server.js already provides '/api/agent/market', 
// we only need '/analysis' here to make the full URL work.
router.get('/analysis', async (req, res) => {
    try {
        const data = await analyzeMarket();
        res.json(data || []); // Safety fallback to empty array
    } catch (error) {
        console.error("Router Error:", error);
        res.status(500).json({ error: "Agent is offline" });
    }
});

module.exports = router;