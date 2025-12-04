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

const generateFixedTransactions = (record) => {
    let fixedList = [];
    const date = new Date(record.month + "-01"); 

    const mappings = [
        { key: 'rent', title: 'House Rent (Fixed)', cat: 'Rent/EMI', type: 'need' },
        { key: 'emi', title: 'EMI Loan (Fixed)', cat: 'Rent/EMI', type: 'need' },
        { key: 'grocery', title: 'Groceries (Monthly)', cat: 'Groceries', type: 'need' },
        { key: 'electricity', title: 'Electricity Bill', cat: 'Bills', type: 'need' },
        { key: 'otherBills', title: 'Mobile/Internet', cat: 'Bills', type: 'need' },
        { key: 'subscriptions', title: 'Subscriptions', cat: 'Life', type: 'want' },
        { key: 'petrol', title: 'Fuel/Transport', cat: 'Travel', type: 'need' },
        { key: 'partyBudget', title: 'Dining/Party Budget', cat: 'Life', type: 'want' },
        { key: 'schoolFees', title: 'School Fees', cat: 'Education', type: 'need' }
    ];

    mappings.forEach(map => {
   
        let amount = 0;
        if (record.expenses && record.expenses[map.key]) amount = record.expenses[map.key];
        if (amount === 0 && record[map.key]) amount = record[map.key]; 

        if (amount > 0) {
            fixedList.push({
                _id: `fixed-${record._id}-${map.key}`, 
                title: map.title,
                amount: amount,
                category: map.cat,
                type: map.type,
                date: date,
                isFixed: true 
            });
        }
    });

    return fixedList;
};

exports.getSpendingAnalysis = async (req, res) => {
    try {
        const { month } = req.query;
        const userId = req.user.id;

        let allRecords = [];

        if (month && month !== 'all') {
            const record = await MonthlyRecord.findOne({ user: userId, month });
            if (record) allRecords.push(record);
        } else {
            allRecords = await MonthlyRecord.find({ user: userId }).sort({ month: -1 });
        }

        let combinedTransactions = [];
        let totalIncome = 0;
        let totalNeeds = 0;
        let totalWants = 0;
        let totalSavings = 0;
        let categoryMap = {};

        allRecords.forEach(record => {
            totalIncome += (record.income || 0);

            const realTrans = record.transactions || [];
            combinedTransactions.push(...realTrans);
            const fixedTrans = generateFixedTransactions(record);
            combinedTransactions.push(...fixedTrans);
            totalSavings += Object.values(record.savings || {}).reduce((a, b) => a + Number(b), 0);
        });

        combinedTransactions.forEach(t => {
            if (t.type === 'need') totalNeeds += t.amount;
            if (t.type === 'want') totalWants += t.amount;
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

        combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        const limits = {
            needs: totalIncome * 0.5,
            wants: totalIncome * 0.3,
            savings: totalIncome * 0.2
        };

        let alerts = [];
        if (totalNeeds > limits.needs && totalIncome > 0) 
            alerts.push({ type: 'warning', msg: `Needs exceeded 50% target by ₹${(totalNeeds - limits.needs).toFixed(0)}` });
        if (totalWants > limits.wants && totalIncome > 0) 
            alerts.push({ type: 'danger', msg: `Wants exceeded 30% target by ₹${(totalWants - limits.wants).toFixed(0)}` });

        res.json({
            breakdown: { needs: totalNeeds, wants: totalWants, savings: totalSavings },
            limits,
            alerts,
            transactions: combinedTransactions, 
            categories: categoryMap
        });

    } catch (err) {
        console.error("Analysis Error:", err);
        res.status(500).send('Server Error');
    }
};