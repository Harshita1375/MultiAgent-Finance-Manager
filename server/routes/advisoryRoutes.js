const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    getAdvisoryData, 
    addGoal, 
    updateGoalProgress, 
    checkAffordability,
    generateMonthlyPlan
} = require('../controllers/advisoryController');

router.get('/dashboard', auth, getAdvisoryData);
router.post('/goals', auth, addGoal);
router.put('/goals/progress', auth, updateGoalProgress);
router.post('/affordability', auth, checkAffordability);
router.get('/plan', auth, generateMonthlyPlan);

module.exports = router;