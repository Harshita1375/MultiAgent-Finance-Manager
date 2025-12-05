const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    getAdvisoryData, 
    addGoal, 
    updateGoalProgress, 
    checkAffordability 
} = require('../controllers/advisoryController');

router.get('/dashboard', auth, getAdvisoryData);
router.post('/goals', auth, addGoal);
router.put('/goals/add-funds', auth, updateGoalProgress);
router.post('/affordability', auth, checkAffordability);

module.exports = router;