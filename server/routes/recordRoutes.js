const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    saveMonthlyRecord, 
    getMonthlyRecord, 
    getAllHistory,
    updateMonthlyRecord, 
    getSpendingAnalysis
} = require('../controllers/recordController');
router.get('/analyze', auth, getSpendingAnalysis);
router.get('/history', auth, getAllHistory);
router.put('/update', auth, updateMonthlyRecord); 
router.post('/', auth, saveMonthlyRecord);
router.get('/', auth, getMonthlyRecord);

module.exports = router;