const MonthlyRecord = require('../models/MonthlyRecord');
const Expense = require('../models/Expense');

// ✅ Function name kept as 'getUserAnalytics' to match your routes
exports.getUserAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month } = req.query; // e.g., "2025-12" or "all"

        // 1. Fetch Fixed Records (For Totals)
        let recordQuery = { user: userId };
        if (month && month !== 'all') {
            recordQuery.month = month;
        }
        const records = await MonthlyRecord.find(recordQuery);

        // 2. Fetch All Expenses (For Charts/Trends)
        const expenses = await Expense.find({ user: userId });

        // --- CALCULATE TOTALS ---
        let totalIncome = 0;
        let totalFixed = 0;
        let totalSavings = 0;
        let totalWalletSpent = 0; // This will track your "Wallet Burn"

        records.forEach(rec => {
            totalIncome += (rec.income || 0);
            
            // Sum Fixed Expenses (Rent, EMI, Bills, etc.)
            const exp = rec.expenses || {};
            totalFixed += (exp.rent||0) + (exp.emi||0) + (exp.grocery||0) + (exp.electricity||0) + (exp.schoolFees||0) + (exp.otherBills||0) + (exp.subscriptions||0);
            
            // Sum Savings (SIP, Gold, Cash)
            const sav = rec.savings || {};
            totalSavings += (sav.sip||0) + (sav.fdRd||0) + (sav.gold||0) + (sav.cash||0);

            // --- CRITICAL FIX: Read Wallet Spend directly from Record ---
            // This ensures the KPI matches your Wallet Widget exactly
            if (rec.wallet) {
                totalWalletSpent += (rec.wallet.spent || 0);
            }
        });

        // --- CHART DATA 1: WALLET PULSE (Last 7 Days) ---
        // Filter for expenses created by the Wallet Widget
        const walletExpenses = expenses.filter(e => 
            e.title.startsWith('Quick:') || 
            e.title.startsWith('Wallet:')
        );

        // Initialize array for last 7 days (Index 6 = Today, Index 0 = 6 days ago)
        const dailyWalletData = Array(7).fill(0); 
        const today = new Date();
        today.setHours(0,0,0,0);

        walletExpenses.forEach(exp => {
            const expDate = new Date(exp.date);
            expDate.setHours(0,0,0,0);
            
            const diffTime = today - expDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // If the expense happened within the last 7 days
            if (diffDays >= 0 && diffDays < 7) {
                dailyWalletData[6 - diffDays] += exp.amount;
            }
        });

        // --- RESPONSE STRUCTURE ---
        // We map the new calculated values to the structure your frontend expects
        res.json({
            // Core Totals (Matches new frontend)
            totalIncome,
            totalSpent: totalFixed + totalWalletSpent, 
            totalSaved: totalSavings,
            
            // Old Structure Support (To prevent crashes if frontend uses 'totals')
            totals: {
                income: totalIncome,
                fixedExpenses: totalFixed + totalWalletSpent,
                savings: totalSavings,
                freeCash: totalWalletSpent // or calculated free cash
            },

            // Detailed Breakdown for Graphs
            breakdown: {
                fixed: totalFixed,
                wants: totalWalletSpent, // We use Wallet Spend as the main "Wants" metric
                savings: totalSavings
            },

            // History Data for Charts
            walletHistory: dailyWalletData,
            
            // Financial Health Scores
            scores: {
                savingsRate: totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0,
                liquidity: totalSavings > 0 ? 80 : 20
            }
        });

    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).send('Server Error');
    }
};