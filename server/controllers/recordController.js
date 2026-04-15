const MonthlyRecord = require('../models/MonthlyRecord');
const Expense = require('../models/Expense'); 
const mongoose = require('mongoose');

const getCategoryType = (category) => {
    const needs = ['Groceries', 'Rent/EMI', 'Bills', 'Education', 'Medical', 'Fuel', 'Travel'];
    return needs.includes(category) ? 'need' : 'want';
};

const generateFixedTransactions = (record) => {
    let fixedList = [];
    if (!record.month) return fixedList;
    
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
        { key: 'schoolFees', title: 'School Fees', cat: 'Education', type: 'need' },
        { key: 'otherExpense', title: 'Misc Expenses', cat: 'Misc', type: 'want' }
    ];

    mappings.forEach(map => {
        let amount = 0;
        if (record.expenses && record.expenses[map.key]) amount = Number(record.expenses[map.key]);
        
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
    if (record.insurance) {
        if (record.insurance.life > 0) {
            fixedList.push({
                _id: `ins-life-${record._id}`,
                title: 'Life Insurance Premium',
                amount: record.insurance.life,
                category: 'Insurance',
                type: 'need',
                date: date,
                isFixed: true
            });
        }
        if (record.insurance.health > 0) {
            fixedList.push({
                _id: `ins-health-${record._id}`,
                title: 'Health Insurance Premium',
                amount: record.insurance.health,
                category: 'Insurance',
                type: 'need',
                date: date,
                isFixed: true
            });
        }
        if (record.insurance.familyHealthInsurance > 0) {
        fixedList.push({
            _id: `ins-family-${record._id}`,
            title: 'Family Health Insurance',
            amount: record.insurance.familyHealthInsurance,
            category: 'Insurance',
            type: 'need',
            date: date,
            isFixed: true
        });
    }
    }

    // 3. ADD THIS: Map Notes as a "Remark" transaction (if it has a value)
    if (record.notes && record.notes.trim() !== "") {
        fixedList.push({
            _id: `note-${record._id}`,
            title: `Note: ${record.notes}`,
            amount: 0, // Notes usually don't have a cost, or you can omit from table
            category: 'Notes',
            type: 'info',
            date: date,
            isFixed: true
        });
    }

    return fixedList;
};

    // controllers/recordController.js
exports.saveMonthlyRecord = async (req, res) => {
    try {
        const { month, income, expenses, savings, insurance, notes } = req.body;

        // Log the incoming insurance data to verify what the backend receives
        console.log("Incoming Insurance Data:", insurance);

        let record = await MonthlyRecord.findOneAndUpdate(
            { user: req.user.id, month: month },
            { $set: { income, expenses, savings, insurance, notes } },
            { new: true, upsert: true, runValidators: true } 
        );

        res.json(record);
    } catch (err) {
        // This will catch if familyHealthInsurance is the wrong type (e.g. string instead of number)
        console.error("❌ Save Error:", err.message);
        res.status(400).json({ msg: "Failed to save insurance data", error: err.message });
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
        const { month, income, expenses, savings,insurance, notes } = req.body;
        const record = await MonthlyRecord.findOneAndUpdate(
            { user: req.user.id, month: month },
            { 
                $set: { income, expenses, savings, insurance, notes } 
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

exports.getSpendingAnalysis = async (req, res) => {
    try {
        const { month } = req.query;
        const userId = req.user.id;

        let monthlyRecords = [];
        let recordQuery = { user: userId };
        
        if (month && month !== 'all') {
            recordQuery.month = month;
            const record = await MonthlyRecord.findOne(recordQuery);
            if (record) monthlyRecords.push(record);
        } else {
            monthlyRecords = await MonthlyRecord.find(recordQuery).sort({ month: -1 });
        }

        let manualExpenses = [];
        let expenseQuery = { user: userId };

        if (month && month !== 'all') {
            const [year, monthNum] = month.split('-');
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 0, 23, 59, 59); 
            
            expenseQuery.date = { 
                $gte: startDate, 
                $lte: endDate 
            };
        }
        manualExpenses = await Expense.find(expenseQuery).sort({ date: -1 });

        let combinedTransactions = [];
        let totalIncome = 0;
        let totalNeeds = 0;
        let totalWants = 0;
        let totalSavings = 0;
        let categoryMap = {};
        let highestWantCategory = { name: '', amount: 0 };

        monthlyRecords.forEach(record => {
            totalIncome += (Number(record.income) || 0);
            
            const fixedTrans = generateFixedTransactions(record);
            combinedTransactions.push(...fixedTrans);

            totalSavings += Object.values(record.savings || {}).reduce((a, b) => a + Number(b), 0);
        });

        manualExpenses.forEach(exp => {
            const type = exp.type || getCategoryType(exp.category); 
            
            combinedTransactions.push({
                _id: exp._id,
                title: exp.title,
                amount: Number(exp.amount),
                category: exp.category,
                type: type,
                date: exp.date,
                isFixed: false
            });
        });

        // 4. Calculate Totals & Analysis
        combinedTransactions.forEach(t => {
            if (t.type === 'need') totalNeeds += t.amount;
            if (t.type === 'want') {
                totalWants += t.amount;
            }

            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
            
            if (t.type === 'want' && categoryMap[t.category] > highestWantCategory.amount) {
                highestWantCategory = { name: t.category, amount: categoryMap[t.category] };
            }
        });

        // Sort by Date (Descending)
        combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        const limits = {
            needs: totalIncome * 0.5,
            wants: totalIncome * 0.3,
            savings: totalIncome * 0.2
        };

        let feedback = [];
        const date = new Date();
        const isCurrentMonth = month === new Date().toISOString().slice(0, 7);

        if (isCurrentMonth) {
            const currentDay = date.getDate();
            const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
            const monthProgress = currentDay / daysInMonth; 

            const projectedWants = totalWants / (monthProgress || 1); 
            if (projectedWants > limits.wants) {
                feedback.push({
                    type: 'danger',
                    title: '🛑 Speed Trap Alert',
                    msg: `You have used ${((totalWants/(limits.wants||1))*100).toFixed(0)}% of your lifestyle budget, but the month is only ${((monthProgress)*100).toFixed(0)}% over.`
                });
            }
        }

        if (highestWantCategory.amount > (limits.wants * 0.4) && highestWantCategory.amount > 0) {
            feedback.push({
                type: 'warning',
                title: `💰 High Spend: ${highestWantCategory.name}`,
                msg: `You've spent ₹${highestWantCategory.amount} on ${highestWantCategory.name}. This is a huge chunk of your budget.`
            });
        }

        if (totalSavings < limits.savings && totalIncome > 0) {
            const deficit = limits.savings - totalSavings;
            feedback.push({
                type: 'info',
                title: '📉 Savings Lagging',
                msg: `You are ₹${deficit.toFixed(0)} short of your 20% savings goal.`
            });
        }

        if (feedback.length === 0 && totalIncome > 0) {
            feedback.push({ type: 'success', title: '🌟 Star Saver', msg: 'Your spending patterns are perfect! Keep it up.' });
        }
        
        if (totalIncome === 0) {
             feedback.push({ type: 'info', title: 'No Data', msg: 'Add income in Profile to get insights.' });
        }

        // 🔥 ADD THIS BEFORE res.json
let totalInsurance = 0;
monthlyRecords.forEach(record => {
    if (record.insurance) {
        totalInsurance += (Number(record.insurance.life) || 0) + 
                         (Number(record.insurance.health) || 0) + 
                         (Number(record.insurance.familyHealthInsurance) || 0);
    }
});

if (totalInsurance === 0) {
    feedback.push({
        type: 'insurance-alert',
        title: '🛡️ Protection Gap',
        msg: 'You have not taken any insurance plan. It is highly recommended to secure your future.'
    });
}

// ✅ THEN send response
res.json({
    breakdown: { needs: totalNeeds, wants: totalWants, savings: totalSavings },
    limits,
    alerts: feedback,
    transactions: combinedTransactions,
    categories: categoryMap
});

        

    } catch (err) {
        console.error("Analysis Error:", err);
        res.status(500).send('Server Error');
    }
};