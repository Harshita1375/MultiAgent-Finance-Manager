const MonthlyRecord = require('../models/MonthlyRecord');
const mongoose = require('mongoose');

exports.saveMonthlyRecord = async (req, res) => {
    try {
        const { month, income, expenses, savings, notes } = req.body;

        let record = await MonthlyRecord.findOneAndUpdate(
            { user: req.user.id, month: month },
            { income, expenses, savings, notes },
            { new: true, upsert: true } 
        );

        res.json(record);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMonthlyRecord = async (req, res) => {
    try {
        const { month } = req.query; 
        const record = await MonthlyRecord.findOne({ user: req.user.id, month });
        
        if (!record) return res.status(200).json({}); 
        res.json(record);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getAllHistory = async (req, res) => {
    try {
        const records = await MonthlyRecord.find({ user: req.user.id }).sort({ month: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};


exports.updateMonthlyRecord = async (req, res) => {
    try {
        const { month, income, expenses, savings, notes } = req.body;
        const record = await MonthlyRecord.findOneAndUpdate(
            { user: req.user.id, month: month },
            { 
                $set: { 
                    income, 
                    expenses, 
                    savings, 
                    notes,
                    totalNeeds: calculateNeeds(expenses), 
                    totalWants: calculateWants(expenses) 
                } 
            },
            { new: true }
        );

        if (!record) return res.status(404).json({ msg: "Record not found" });
        res.json(record);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const calculateNeeds = (exp) => (exp.rent || 0) + (exp.emi || 0) + (exp.grocery || 0) + (exp.electricity || 0);
const calculateWants = (exp) => (exp.subscriptions || 0) + (exp.partyBudget || 0) + (exp.otherExpense || 0);

exports.getSpendingAnalysis = async (req, res) => {
    try {
        const { month } = req.query;
        const userId = req.user.id;

        let result = {
            breakdown: { needs: 0, wants: 0, savings: 0 },
            limits: { needs: 0, wants: 0, savings: 0 },
            transactions: [],
            categories: {}
        };

        let income = 0;

        if (month && month !== 'all') {
            const record = await MonthlyRecord.findOne({ user: userId, month });
            if (record) {
                const needs = (record.expenses.rent || 0) + (record.expenses.emi || 0) + (record.expenses.electricity || 0) + (record.expenses.grocery || 0);
                const wants = (record.expenses.subscriptions || 0) + (record.expenses.partyBudget || 0) + (record.expenses.otherExpense || 0); // Add otherExpense to wants
                
                const varNeeds = record.transactions.filter(t => t.type === 'need').reduce((a, b) => a + b.amount, 0);
                const varWants = record.transactions.filter(t => t.type === 'want').reduce((a, b) => a + b.amount, 0);

                result.breakdown.needs = needs + varNeeds;
                result.breakdown.wants = wants + varWants;
                result.breakdown.savings = Object.values(record.savings || {}).reduce((a, b) => a + Number(b), 0);
                
                result.transactions = record.transactions.reverse();
                income = record.income || 0;

                result.categories = {
                    "Rent/EMI": (record.expenses.rent || 0) + (record.expenses.emi || 0),
                    "Bills": (record.expenses.electricity || 0) + (record.expenses.otherBills || 0),
                    "Life": record.expenses.subscriptions || 0,
                };
                record.transactions.forEach(t => {
                    result.categories[t.category] = (result.categories[t.category] || 0) + t.amount;
                });
            }
        } else {
            const agg = await MonthlyRecord.aggregate([
                { $match: { user: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalIncome: { $sum: "$income" },
                        
                        fixRent: { $sum: "$expenses.rent" },
                        fixEmi: { $sum: "$expenses.emi" },
                        fixGroc: { $sum: "$expenses.grocery" },
                        fixElec: { $sum: "$expenses.electricity" },
                        fixSub: { $sum: "$expenses.subscriptions" },
                        fixParty: { $sum: "$expenses.partyBudget" },
                        
                        totalSavings: { $sum: { $add: ["$savings.sip", "$savings.fdRd", "$savings.gold"] } },
                        
                        allTrans: { $push: "$transactions" }
                    }
                },
                {
                    $project: {
                        totalIncome: 1,
                        fixNeeds: { $add: ["$fixRent", "$fixEmi", "$fixGroc", "$fixElec"] },
                        fixWants: { $add: ["$fixSub", "$fixParty"] },
                        totalSavings: 1,
                        flatTrans: { $reduce: { input: "$allTrans", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } }
                    }
                }
            ]);

            if (agg.length > 0) {
                const r = agg[0];
                income = r.totalIncome;
                
                const varNeeds = r.flatTrans.filter(t => t.type === 'need').reduce((a, b) => a + b.amount, 0);
                const varWants = r.flatTrans.filter(t => t.type === 'want').reduce((a, b) => a + b.amount, 0);

                result.breakdown.needs = r.fixNeeds + varNeeds;
                result.breakdown.wants = r.fixWants + varWants;
                result.breakdown.savings = r.totalSavings;
                
                result.transactions = r.flatTrans.sort((a, b) => new Date(b.date) - new Date(a.date));

                result.categories = {};
                r.flatTrans.forEach(t => {
                    result.categories[t.category] = (result.categories[t.category] || 0) + t.amount;
                });
            }
        }

        result.limits = {
            needs: income * 0.5,
            wants: income * 0.3,
            savings: income * 0.2
        };

        let alerts = [];
        if (result.breakdown.needs > result.limits.needs && income > 0) 
            alerts.push({ type: 'warning', msg: `Needs exceeded 50% limit by ₹${(result.breakdown.needs - result.limits.needs).toFixed(0)}.` });
        if (result.breakdown.wants > result.limits.wants && income > 0) 
            alerts.push({ type: 'danger', msg: `Wants exceeded 30% limit by ₹${(result.breakdown.wants - result.limits.wants).toFixed(0)}.` });

        res.json({ ...result, alerts });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};