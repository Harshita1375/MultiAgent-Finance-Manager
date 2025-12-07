const MonthlyRecord = require('../models/MonthlyRecord');
const Expense = require('../models/Expense');

exports.getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month } = req.query; // e.g. "2025-12" or "all"

        // 1. Define Date Range for filtering
        let recordQuery = { user: userId };
        let expenseQuery = { user: userId };
        
        if (month && month !== 'all') {
            recordQuery.month = month;
            
            // Calculate date range for Expenses collection
            const [year, monthNum] = month.split('-');
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 0, 23, 59, 59);
            expenseQuery.date = { $gte: startDate, $lte: endDate };
        }

        // 2. Fetch Data
        const records = await MonthlyRecord.find(recordQuery);
        const variableExpenses = await Expense.find(expenseQuery).sort({ date: -1 });

        // 3. Calculate Aggregates
        let totalIncome = 0;
        let totalFixed = 0; // Rent, EMI, etc.
        let totalInvested = 0; // SIP, Gold (Planned Savings)
        let totalVariable = 0; // Wallet + Manual Expenses

        records.forEach(rec => {
            totalIncome += (rec.income || 0);
            
            const exp = rec.expenses || {};
            totalFixed += (exp.rent||0) + (exp.emi||0) + (exp.grocery||0) + (exp.electricity||0) + 
                          (exp.schoolFees||0) + (exp.otherBills||0) + (exp.subscriptions||0);
            
            const sav = rec.savings || {};
            totalInvested += (sav.sip||0) + (sav.fdRd||0) + (sav.gold||0);
        });

        // Sum up variable expenses (Wallet + Manual)
        totalVariable = variableExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        // 4. Calculate "True Savings"
        const totalSpent = totalFixed + totalVariable;
        // True Savings = Money you kept (Investments + Unspent Cash)
        const totalSaved = Math.max(0, totalIncome - totalSpent); 

        // 5. Get Top 3 Recent Transactions (For Display)
        const recentTransactions = variableExpenses.slice(0, 3).map(tx => ({
            id: tx._id,
            title: tx.title.replace('Quick:', '').replace('Wallet:', '').trim(), // Clean Title
            amount: tx.amount,
            date: tx.date,
            type: tx.type || 'want'
        }));

        // 6. Get Top 3 Upcoming Payments (From latest record fixed expenses)
        // We use the latest month's profile to predict upcoming bills
        let upcomingTransactions = [];
        const latestRec = await MonthlyRecord.findOne({ user: userId }).sort({ month: -1 });
        if (latestRec && latestRec.expenses) {
            const exp = latestRec.expenses;
            const potentialBills = [
                { title: 'House Rent', amount: exp.rent },
                { title: 'EMI / Loan', amount: exp.emi },
                { title: 'Electricity', amount: exp.electricity },
                { title: 'SIP Investment', amount: latestRec.savings?.sip || 0 }
            ];
            // Filter non-zero bills
            upcomingTransactions = potentialBills
                .filter(b => b.amount > 0)
                .slice(0, 3)
                .map((b, i) => ({ id: i, title: b.title, amount: b.amount, date: 'Due Soon' }));
        }

        // --- CHART DATA (Wallet Pulse) ---
        const dailyWalletData = Array(7).fill(0);
        const today = new Date();
        today.setHours(0,0,0,0);
        
        variableExpenses.forEach(exp => {
            // Only count recent ones for the chart
            const d = new Date(exp.date);
            d.setHours(0,0,0,0);
            const diff = Math.floor((today - d) / (1000 * 60 * 60 * 24));
            if (diff >= 0 && diff < 7) dailyWalletData[6 - diff] += exp.amount;
        });

        res.json({
            totalIncome,
            totalSpent,
            totalSaved, // This is now Dynamic (Income - Spent)
            
            breakdown: {
                fixed: totalFixed,
                wants: totalVariable,
                savings: totalInvested // Only planned investments
            },
            
            recentTransactions,
            upcomingTransactions,
            walletHistory: dailyWalletData,
            
            scores: {
                savingsRate: totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0,
                liquidity: totalSaved > 0 ? 80 : 20
            }
        });

    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).send('Server Error');
    }
};