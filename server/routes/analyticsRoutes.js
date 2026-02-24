const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUserAnalytics } = require('../controllers/analyticsController');

router.get('/', auth, getUserAnalytics);

module.exports = router;