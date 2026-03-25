const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    savedAmount: { type: Number, default: 0 },
    deadline: { type: Date },
    category: { 
        type: String, 
        enum: ['Short-Term', 'Long-Term', 'Retirement'], 
        default: 'Short-Term' 
    },
    priority: { type: String, default: 'Medium' },
    status: { type: String, default: 'Active' },
    date: { type: Date, default: Date.now }
}, { timestamps: true }); // <--- ADD THIS LINE HERE

module.exports = mongoose.model('Goal', GoalSchema);