const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    getAdvisoryData, 
    addGoal, 
    updateGoalProgress, 
    checkAffordability,
    generateMonthlyPlan,
    deleteGoal,   
    updateGoal
} = require('../controllers/advisoryController');

router.get('/analysis', auth, getAdvisoryData);
router.post('/goals', auth, addGoal);
router.patch('/goals/progress', auth, updateGoalProgress);
router.post('/affordability', auth, checkAffordability);
router.get('/plan', auth, generateMonthlyPlan);
router.delete('/goals/:id', auth, deleteGoal);
router.put('/goals/:id', auth, updateGoal);

module.exports = router;