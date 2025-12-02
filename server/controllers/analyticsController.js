const User = require('../models/User');

exports.getUserAnalytics = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user || !user.profile) {
            return res.status(400).json({ msg: 'Profile not found' });
        }

        const p = user.profile;

        // 1. Calculate Totals
        const income = p.netEarnings || 0;
        
        // Summing specific categories
        const fixedExpenses = 
            (p.expenses?.emi || 0) +
            (p.expenses?.rent || 0) +
            (p.expenses?.grocery || 0) +
            (p.expenses?.electricity || 0) +
            (p.expenses?.otherBills || 0) +
            (p.expenses?.subscriptions || 0) +
            (p.expenses?.petrol || 0) +
            (p.expenses?.otherExpense || 0);
        
        const lifestyleExpenses = 
            (p.lifestyle?.partyBudget || 0) + 
            (p.demographics?.schoolFees || 0);

        const savings = 
            (p.savings?.sip || 0) +
            (p.savings?.fdRd || 0) +
            (p.savings?.gold || 0);

        const totalOutflow = fixedExpenses + lifestyleExpenses + savings;
        const freeCash = income - totalOutflow;

        // 2. Calculate Health Scores (0-100 Scale)
        // Avoid division by zero
        const safeIncome = income > 0 ? income : 1; 

        const savingsRate = Math.min(((savings / safeIncome) * 100), 100);
        const expenseRatio = Math.min(((fixedExpenses / safeIncome) * 100), 100);
        
        // Expense Control Score: Higher is better (100 - expense ratio)
        const expenseControlScore = Math.max(0, 100 - expenseRatio);

        // 3. AI Insight Logic
        let insight = "Your profile looks balanced.";
        if (freeCash < 0) insight = "⚠️ Warning: You are spending more than you earn. Review your Fixed Expenses.";
        else if (savingsRate < 20) insight = "⚠️ Your savings rate is low (below 20%). Consider increasing your SIPs.";
        else insight = "✅ Excellent! You are saving wisely and living within your means.";

        // 4. Send the calculated package
        res.json({
            totals: {
                income,
                fixedExpenses,
                lifestyleExpenses,
                savings,
                freeCash: Math.max(0, freeCash) // Don't show negative free cash
            },
            scores: {
                savingsRate: Math.round(savingsRate),
                expenseControl: Math.round(expenseControlScore),
                luxuryScore: Math.round((lifestyleExpenses / safeIncome) * 100)
            },
            insight
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};