const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSavingsAnalysis, analyzeAsset, getTradingSuggestions } = require('../controllers/savingAgentController');

router.get('/analyze', auth, getSavingsAnalysis);
router.post('/analyze', analyzeAsset);
router.get('/trading', auth, getTradingSuggestions);

module.exports = router;