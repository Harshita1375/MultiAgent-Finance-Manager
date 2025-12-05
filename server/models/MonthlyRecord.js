const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true }, 
    type: { type: String, enum: ['need', 'want'], default: 'want' }, 
    date: { type: Date, default: Date.now }
});

const MonthlyRecordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: { type: String, required: true }, 
    
    income: { type: Number, default: 0 },

    wallet: {
        limit: { type: Number, default: 0 }, 
        spent: { type: Number, default: 0 }, 
        transactions: [TransactionSchema]    
    },

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

    transactions: [TransactionSchema], 
    totalNeeds: { type: Number, default: 0 },
    totalWants: { type: Number, default: 0 },

    savings: {
        sip: { type: Number, default: 0 },
        fdRd: { type: Number, default: 0 },
        gold: { type: Number, default: 0 },
        cash: { type: Number, default: 0 } 
    },
    
    notes: { type: String }
});

MonthlyRecordSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyRecord', MonthlyRecordSchema);