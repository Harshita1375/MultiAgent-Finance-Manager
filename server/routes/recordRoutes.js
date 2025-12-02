const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    saveMonthlyRecord, 
    getMonthlyRecord, 
    getAllHistory 
} = require('../controllers/recordController');
router.post('/', auth, saveMonthlyRecord);
router.get('/', auth, getMonthlyRecord);
router.get('/history', auth, getAllHistory);

module.exports = router;