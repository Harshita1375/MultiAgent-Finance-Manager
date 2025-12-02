const mongoose = require('mongoose');

const MonthlyRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: { type: String, required: true }, 
    
    income: { type: Number, default: 0 },

    expenses: {
        emi: { type: Number, default: 0 },
        rent: { type: Number, default: 0 },
        grocery: { type: Number, default: 0 },
        electricity: { type: Number, default: 0 },
        otherBills: { type: Number, default: 0 },
        subscriptions: { type: Number, default: 0 },
        petrol: { type: Number, default: 0 },
        otherExpense: { type: Number, default: 0 }
    },

    // Savings Breakdown
    savings: {
        sip: { type: Number, default: 0 },
        fdRd: { type: Number, default: 0 },
        gold: { type: Number, default: 0 }
    },
    
    notes: { type: String }
});

MonthlyRecordSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyRecord', MonthlyRecordSchema);