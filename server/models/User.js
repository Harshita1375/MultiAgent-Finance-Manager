const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    date: { type: Date, default: Date.now },

    profile: {
        currency: { type: String, default: 'INR' },
        netEarnings: { type: Number, default: 0 },
        
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

        demographics: {
            maritalStatus: { type: String, default: 'single' },
            hasChildren: { type: String, default: 'no' },
            schoolFees: { type: Number, default: 0 }
        },

        lifestyle: {
            partyBudget: { type: Number, default: 0 }
        },

        savings: {
            sip: { type: Number, default: 0 },
            fdRd: { type: Number, default: 0 },
            gold: { type: Number, default: 0 }
        },

        notes: { type: String, default: '' },
        
        isProfileComplete: { type: Boolean, default: false }
    }
});

module.exports = mongoose.model('User', UserSchema);