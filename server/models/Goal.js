const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    savedAmount: { type: Number, default: 0 },
    deadline: { type: Date }, 
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', GoalSchema);