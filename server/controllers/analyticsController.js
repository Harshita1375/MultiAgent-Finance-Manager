const MonthlyRecord = require('../models/MonthlyRecord');
const Expense = require('../models/Expense');

exports.getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month } = req.query; 

        let recordQuery = { user: userId };
        if (month && month !== 'all') {
            recordQuery.month = month;
        }
        const records = await MonthlyRecord.find(recordQuery);
        
        const latestRecord = await MonthlyRecord.findOne({ user: userId }).sort({ month: -1 });

        const allExpenses = await Expense.find({ user: userId }).sort({ date: -1 });

        let totalIncome = 0;
        let totalFixed = 0;
        let totalSavings = 0;
        let totalWalletSpent = 0;

        records.forEach(rec => {
            totalIncome += (rec.income || 0);
            const exp = rec.expenses || {};
            totalFixed += (exp.rent||0) + (exp.emi||0) + (exp.grocery||0) + (exp.electricity||0) + (exp.schoolFees||0) + (exp.otherBills||0) + (exp.subscriptions||0);
            const sav = rec.savings || {};
            totalSavings += (sav.sip||0) + (sav.fdRd||0) + (sav.gold||0) + (sav.cash||0);
            if (rec.wallet) {
                totalWalletSpent += (rec.wallet.spent || 0);
            }
        });

        const recentTransactions = allExpenses.slice(0, 3).map(e => ({
            id: e._id,
            title: e.title || e.category,
            amount: e.amount,
            date: e.date,
            type: e.type 
        }));

        let upcomingTransactions = [];
        if (latestRecord && latestRecord.expenses) {
            const exp = latestRecord.expenses;
            const fixedList = [
                { title: 'House Rent', amount: exp.rent },
                { title: 'EMI / Loan', amount: exp.emi },
                { title: 'Electricity Bill', amount: exp.electricity },
                { title: 'Subscriptions', amount: exp.subscriptions }
            ];
            upcomingTransactions = fixedList
                .filter(item => item && item.amount > 0)
                .slice(0, 3)
                .map((item, index) => ({
                    id: `upcoming-${index}`,
                    title: item.title,
                    amount: item.amount,
                    date: 'Due soon'
                }));
        }

        const walletExpenses = allExpenses.filter(e => 
            e.title.startsWith('Quick:') || e.title.startsWith('Wallet:')
        );
        const dailyWalletData = Array(7).fill(0); 
        const today = new Date();
        today.setHours(0,0,0,0);

        walletExpenses.forEach(exp => {
            const expDate = new Date(exp.date);
            expDate.setHours(0,0,0,0);
            const diffDays = Math.floor((today - expDate) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
                dailyWalletData[6 - diffDays] += exp.amount;
            }
        });

        res.json({
            totalIncome,
            totalSpent: totalFixed + totalWalletSpent, 
            totalSaved: totalSavings,
            breakdown: { fixed: totalFixed, wants: totalWalletSpent, savings: totalSavings },
            walletHistory: dailyWalletData,
            scores: {
                savingsRate: totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0,
                liquidity: totalSavings > 0 ? 80 : 20
            },
            recentTransactions,
            upcomingTransactions
        });

    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).send('Server Error');
    }
};