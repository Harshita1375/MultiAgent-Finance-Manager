const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSavingsAnalysis, analyzeAsset } = require('../controllers/savingAgentController');

router.get('/analyze', auth, getSavingsAnalysis);
router.post('/asset-audit', auth, analyzeAsset);

module.exports = router;