const Expense = require('../models/Expense');

// Get all expenses for the logged-in user
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Add a new expense
exports.addExpense = async (req, res) => {
    try {
        const { title, amount, category } = req.body;
        const newExpense = new Expense({
            title,
            amount,
            category,
            user: req.user.id
        });
        const expense = await newExpense.save();
        res.json(expense);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
    try {
        let expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ msg: 'Expense not found' });

        // Ensure user owns the expense
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Expense.findByIdAndRemove(req.params.id);
        res.json({ msg: 'Expense removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};