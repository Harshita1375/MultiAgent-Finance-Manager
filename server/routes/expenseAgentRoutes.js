const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addTransaction, deleteTransaction } = require('../controllers/expenseAgentController');

router.post('/add', auth, addTransaction);

router.post('/delete', auth, deleteTransaction);

module.exports = router;