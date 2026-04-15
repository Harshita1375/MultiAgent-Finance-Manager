const express = require('express');
const router = express.Router();

const retirementController = require('../controllers/retirementController');
const auth = require('../middleware/auth');
console.log("🔥 retirementRoutes file is loaded");
router.post('/analyze', auth, retirementController.getRetirementAnalysis);
console.log("🔥 retirementRoutes file is loaded");
module.exports = router;