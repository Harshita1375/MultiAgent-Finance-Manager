const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUserAnalytics } = require('../controllers/analyticsController');

// @route   GET /api/analytics
// @access  Private
router.get('/', auth, getUserAnalytics);

module.exports = router;