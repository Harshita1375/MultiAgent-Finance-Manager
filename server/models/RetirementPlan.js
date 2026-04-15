const mongoose = require('mongoose');

const RetirementPlanSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetAge: { type: Number, default: 60 },
    currentAge: { type: Number, required: true },
    estimatedLifeExpectancy: { type: Number, default: 85 },
    inflationRate: { type: Number, default: 6 },
    expectedReturns: { type: Number, default: 12 },
    
    analysis: {
        requiredCorpus: Number,
        monthlyInvestmentNeeded: Number,
        currentShortfall: Number,
        status: { type: String, enum: ['On Track', 'Lagging', 'Critical'] },
        aiSuggestions: [String]
    },
    updatedAt: { type: Date, default: Date.now }
});

// 🚀 FORCE THE COLLECTION NAME HERE
// Replace 'retirementplans' with the EXACT name you see in your MongoDB Atlas/Compass
module.exports = mongoose.model('RetirementPlan', RetirementPlanSchema, 'retirementplans');