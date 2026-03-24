const mongoose = require('mongoose');
const MonthlyRecord = require('../models/MonthlyRecord');
const Goal = require('../models/Goal');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');

// ================= GET ADVISORY DATA =================
exports.getAdvisoryData = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentMonthStr = new Date().toISOString().slice(0, 7);

        const record = await MonthlyRecord.findOne({
            user: userId,
            month: currentMonthStr
        });

        const income = record?.income || 0;
        const expenses = record?.expenses || {};
        const savings = record?.savings || {};

        const totalFixed =
            (expenses.rent || 0) +
            (expenses.emi || 0) +
            (expenses.grocery || 0) +
            (expenses.electricity || 0);

        const totalSaved =
            (savings.sip || 0) +
            (savings.fdRd || 0) +
            (savings.gold || 0) +
            (savings.cash || 0);

        const totalWants =
            (expenses.subscriptions || 0) +
            (expenses.partyBudget || 0);

        const freeCash = Math.max(0, income - totalFixed - totalSaved - totalWants);

        // ✅ FIXED: userId directly (NO ObjectId conversion)
        const goals = await Goal.find({
            user: userId,
            status: 'Active'
        });

        // Normalize category
        const normalizedGoals = goals.map(g => ({
            ...g.toObject(),
            category: g.category || 'Short-Term'
        }));

        // Group goals
        const groupedGoals = {
            shortTerm: normalizedGoals.filter(g => g.category === 'Short-Term'),
            longTerm: normalizedGoals.filter(g => g.category === 'Long-Term'),
            retirement: normalizedGoals.filter(g => g.category === 'Retirement')
        };

        const advice = [];
        if (totalSaved < income * 3) {
            advice.push({
                type: 'critical',
                text: "Build Emergency Fund",
                detail: `Target: ₹${(income * 3).toLocaleString()}. Current: ₹${totalSaved.toLocaleString()}.`
            });
        }

        // Debug logs
        console.log("USER ID:", userId);
        console.log("GOALS FOUND:", normalizedGoals.length);

        res.json({
            metrics: { income, freeCash, totalSaved },
            goals: groupedGoals,
            advice
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.addGoal = async (req, res) => {
    try {
        const { title, targetAmount, deadline, category, priority } = req.body;
        
        const newGoal = new Goal({
            user: req.user.id,
            title,
            targetAmount,
            deadline,
            category: category || 'Short-Term', // Safety default
            priority: priority || 'Medium'
        });

        await newGoal.save();
        res.json(newGoal);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// ... (Other functions remain the same)

exports.updateGoalProgress = async (req, res) => {
    try {
        const { goalId, amount } = req.body;
        const goal = await Goal.findById(goalId);
        
        if (!goal) return res.status(404).json({ msg: "Goal not found" });

        goal.savedAmount += Number(amount);

        if (goal.status !== 'Completed' && goal.savedAmount >= goal.targetAmount) {
            goal.status = 'Completed';
            await Notification.create({
                user: req.user.id,
                title: 'Goal Achieved! 🏆',
                message: `Congratulations! You've fully funded your ${goal.category} goal "${goal.title}".`,
                type: 'success', 
                date: new Date()
            });
        }

        await goal.save();
        res.json(goal);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.checkAffordability = async (req, res) => {
    try {
        const { cost } = req.body;
        const userId = req.user.id;
        const currentMonthStr = new Date().toISOString().slice(0, 7);
        
        const record = await MonthlyRecord.findOne({ user: userId, month: currentMonthStr });
        const income = record?.income || 0;
        const liquidCash = (record?.savings?.cash || 0) + (Math.max(0, income - (record?.expenses?.rent||0) - (record?.savings?.sip||0)));

        let verdict = "safe";
        let message = "Go ahead! You have enough liquid cash.";

        if (cost > liquidCash) {
            verdict = "danger";
            message = `❌ You cannot afford this. It exceeds your liquid cash (₹${liquidCash}).`;
        } else if (cost > liquidCash * 0.5) {
            verdict = "warning";
            message = `⚠️ Careful. This purchase will wipe out 50% of your available cash.`;
        }

        res.json({ verdict, message, liquidCash });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.generateMonthlyPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentMonthStr = new Date().toISOString().slice(0, 7);

        const record = await MonthlyRecord.findOne({ user: userId, month: currentMonthStr });
        if (!record) return res.status(404).json({ msg: "No data to base plan on." });

        const income = record.income || 0;
        const expenses = record.expenses || {};
        const wallet = record.wallet || { limit: 0, spent: 0 };

        const hardFixed = (expenses.rent || 0) + (expenses.emi || 0) + (expenses.schoolFees || 0); 
        const softFixed = (expenses.grocery || 0) + (expenses.electricity || 0) + (expenses.otherBills || 0) + (expenses.petrol || 0); 
        const variableWants = (expenses.subscriptions || 0) + (expenses.partyBudget || 0) + (expenses.otherExpense || 0); 
        
        const today = new Date();
        const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));
        const recentDiscretionary = await Expense.find({ 
            user: userId, 
            date: { $gte: thirtyDaysAgo },
            type: 'want' 
        });
        const actualVariableSpend = recentDiscretionary.reduce((sum, e) => sum + e.amount, 0);

        const currentTotalWants = variableWants + actualVariableSpend;
        const currentWallet = wallet.limit;
        const currentTotalOutflow = hardFixed + softFixed + currentTotalWants + currentWallet;
        const currentPotentialSavings = Math.max(0, income - currentTotalOutflow);

        let optimizationSteps = [];
        const optimizedSoftFixed = softFixed * 0.95; 
        if (softFixed > 0) optimizationSteps.push(`Optimize utilities & groceries by ₹${Math.round(softFixed - optimizedSoftFixed)}`);

        let optimizedWants = 0;
        if (currentTotalWants > (income * 0.20)) {
            optimizedWants = income * 0.15;
            optimizationSteps.push(`Strict cap on lifestyle expenses (Max ₹${Math.round(optimizedWants)})`);
        } else {
            optimizedWants = currentTotalWants * 0.80; 
            if (currentTotalWants > 0) optimizationSteps.push(`Reduce discretionary spending by 20%`);
        }

        const optimizedWallet = currentWallet * 0.85;
        if (currentWallet > 0) optimizationSteps.push(`Tighten Daily Wallet limit to ₹${Math.round(optimizedWallet)}`);

        const optimizedTotalOutflow = hardFixed + optimizedSoftFixed + optimizedWants + optimizedWallet;
        const optimizedSavings = Math.max(0, income - optimizedTotalOutflow);

        res.json({
            income,
            breakdown: {
                hardFixed,
                softFixed: { current: softFixed, target: Math.round(optimizedSoftFixed) },
                wants: { current: currentTotalWants, target: Math.round(optimizedWants) },
                wallet: { current: currentWallet, target: Math.round(optimizedWallet) }
            },
            savings: {
                current: Math.round(currentPotentialSavings),
                projected: Math.round(optimizedSavings)
            },
            improvement: {
                savedAmount: Math.round(optimizedSavings - currentPotentialSavings),
                percentage: currentTotalOutflow > 0 ? (((currentTotalOutflow - optimizedTotalOutflow) / currentTotalOutflow) * 100).toFixed(1) : 0,
                steps: optimizationSteps
            }
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};