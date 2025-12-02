const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true }, // e.g., 'Food', 'Rent'
    date: { type: Date, default: Date.now },
    
    // AI Agent Fields
    aiAnalysis: { type: String, default: '' },
    tags: [String] 
});

module.exports = mongoose.model('Expense', ExpenseSchema);