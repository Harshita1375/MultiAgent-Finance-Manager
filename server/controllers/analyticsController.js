const MonthlyRecord = require('../models/MonthlyRecord');
const mongoose = require('mongoose'); 

exports.getUserAnalytics = async (req, res) => {
    try {
        const { month } = req.query; 
        const userId = req.user.id;
        
        let finalData = {
            totals: { income: 0, fixedExpenses: 0, savings: 0, freeCash: 0 },
            scores: { savingsRate: 0, expenseControl: 0, liquidity: 0 },
            insight: "Add records in Profile to see analytics."
        };

        let rawData = {
            income: 0,
            expenses: { emi:0, rent:0, grocery:0, electricity:0, otherBills:0, subscriptions:0, petrol:0, otherExpense:0 },
            savings: { sip:0, fdRd:0, gold:0 }
        };

        if (month && month !== 'all') {
            const record = await MonthlyRecord.findOne({ user: userId, month });
            if (record) {
                rawData = record.toObject();
            }
        } else {
            const agg = await MonthlyRecord.aggregate([
                { 
                    $match: { 
                        user: new mongoose.Types.ObjectId(userId) 
                    } 
                },
                {
                    $group: {
                        _id: null,
                        totalIncome: { $sum: "$income" },
                        totalEmi: { $sum: "$expenses.emi" },
                        totalRent: { $sum: "$expenses.rent" },
                        totalGrocery: { $sum: "$expenses.grocery" },
                        totalElectricity: { $sum: "$expenses.electricity" },
                        totalOtherBills: { $sum: "$expenses.otherBills" },
                        totalSubs: { $sum: "$expenses.subscriptions" },
                        totalPetrol: { $sum: "$expenses.petrol" },
                        totalOtherExp: { $sum: "$expenses.otherExpense" },
                        totalSip: { $sum: "$savings.sip" },
                        totalFdRd: { $sum: "$savings.fdRd" },
                        totalGold: { $sum: "$savings.gold" },
                    }
                }
            ]);

            if (agg.length > 0) {
                const res = agg[0];
                rawData.income = res.totalIncome;
                rawData.expenses = {
                    emi: res.totalEmi, rent: res.totalRent, grocery: res.totalGrocery,
                    electricity: res.totalElectricity, otherBills: res.totalOtherBills,
                    subscriptions: res.totalSubs, petrol: res.totalPetrol, otherExpense: res.totalOtherExp
                };
                rawData.savings = {
                    sip: res.totalSip, fdRd: res.totalFdRd, gold: res.totalGold
                };
            }
        }

        const totalFixedExpenses = Object.values(rawData.expenses || {}).reduce((a, b) => a + (Number(b) || 0), 0);
        const totalSavings = Object.values(rawData.savings || {}).reduce((a, b) => a + (Number(b) || 0), 0);
        const income = rawData.income || 0;
        const freeCash = Math.max(0, income - (totalFixedExpenses + totalSavings));
        
        const safeIncome = income > 0 ? income : 1;
        const savingsRate = Math.min(((totalSavings / safeIncome) * 100), 100);
        const expenseRatio = Math.min(((totalFixedExpenses / safeIncome) * 100), 100);

        finalData = {
            totals: {
                income,
                fixedExpenses: totalFixedExpenses,
                savings: totalSavings,
                freeCash
            },
            scores: {
                savingsRate: Math.round(savingsRate),
                expenseControl: Math.round(100 - expenseRatio),
                liquidity: freeCash > 0 ? 80 : 20
            },
            insight: freeCash < 0 ? "⚠️ Expenses exceed income!" : "✅ Financials look stable."
        };

        res.json(finalData);

    } catch (err) {
        console.error("Analytics Error:", err.message);
        res.status(500).send('Server Error');
    }
};