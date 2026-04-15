const express = require('express');
const router = express.Router();

const retirementController = require('../controllers/retirementController');
const auth = require('../middleware/auth');
router.post('/analyze', auth, retirementController.getRetirementAnalysis);
module.exports = router;