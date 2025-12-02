const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Protect these routes
const { getExpenses, addExpense, deleteExpense } = require('../controllers/expenseController');

router.get('/', auth, getExpenses);
router.post('/', auth, addExpense);
router.delete('/:id', auth, deleteExpense);

module.exports = router;