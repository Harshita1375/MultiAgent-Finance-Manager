const Expense = require('../models/Expense');
const RetirementPlan = require('../models/RetirementPlan');

exports.getRetirementAnalysis = async (req, res) => {
    try {
        const userId = req.user.id;

        // 🔹 Get retirement plan
        let plan = await RetirementPlan.findOne({ user: userId });

        // 🔹 Fallback plan (if not saved)
        if (!plan) {
            const { currentAge, targetAge, inflationRate, expectedReturns } = req.body || {};

            plan = {
                currentAge: currentAge || 25,
                targetAge: targetAge || 60,
                inflationRate: inflationRate || 6,
                expectedReturns: expectedReturns || 12
            };

            console.log("⚠️ Using fallback retirement inputs");
        }

        // 🔥 FETCH EXPENSE DATA (MAIN FIX)
        const expenses = await Expense.find({ user: userId });

        console.log("🧾 Expenses:", expenses);

        if (!expenses || expenses.length === 0) {
            return res.json({
                analysis: {
                    requiredCorpus: 0,
                    monthlyInvestmentNeeded: 0,
                    currentShortfall: 0,
                    status: 'Critical',
                    aiSuggestions: ["No expense data found. Add expenses to see forecast."]
                },
                currentMonthlySavings: 0
            });
        }

        // 🔹 Calculate Needs & Wants
        let totalNeeds = 0;
        let totalWants = 0;

        expenses.forEach(e => {
            const category = e.category.toLowerCase();

            // 👉 Basic classification (you can improve later)
            if (
                category.includes('rent') ||
                category.includes('grocery') ||
                category.includes('bill') ||
                category.includes('electricity')
            ) {
                totalNeeds += e.amount;
            } else {
                totalWants += e.amount;
            }
        });

        console.log("💰 Needs:", totalNeeds);
        console.log("🎯 Wants:", totalWants);

        const monthlyExpense = totalNeeds + totalWants;
        const annualExpense = monthlyExpense * 12;

        // 🔹 If still no expense
        if (annualExpense === 0) {
            return res.json({
                analysis: {
                    requiredCorpus: 0,
                    monthlyInvestmentNeeded: 0,
                    currentShortfall: 0,
                    status: 'Critical',
                    aiSuggestions: ["Expenses are zero. Add proper data."]
                },
                currentMonthlySavings: 0
            });
        }

        // 🔹 Extract plan values
        const { currentAge, targetAge, inflationRate, expectedReturns } = plan;

        const yearsToRetirement = targetAge - currentAge;

        if (yearsToRetirement <= 0) {
            return res.status(400).json({ message: "Invalid age values." });
        }

        // 🔹 Financial calculations
        const inflation = inflationRate / 100;
        const returns = expectedReturns / 100;

        const futureAnnualExpense =
            annualExpense * Math.pow((1 + inflation), yearsToRetirement);

        const requiredCorpus = futureAnnualExpense * 25;

        const r = returns / 12;
        const n = yearsToRetirement * 12;

        const monthlyNeeded =
            r === 0
                ? (requiredCorpus / n)
                : (requiredCorpus * r) / (Math.pow((1 + r), n) - 1);

        // 🔹 TEMP: No savings model yet
        const currentMonthlySavings = 0;

        const shortfall = monthlyNeeded - currentMonthlySavings;

        // 🔹 AI Analysis
        const analysis = {
            requiredCorpus,
            monthlyInvestmentNeeded: monthlyNeeded,
            currentShortfall: shortfall,
            status:
                shortfall <= 0
                    ? 'On Track'
                    : shortfall < monthlyNeeded * 0.3
                    ? 'Lagging'
                    : 'Critical',
            aiSuggestions:
                shortfall > 0
                    ? [`You have a monthly shortfall of ₹${shortfall.toFixed(0)}.`]
                    : ["Great job! You are on track."]
        };

        // 🔹 Final response
        return res.json({
            analysis,
            currentMonthlySavings
        });

    } catch (err) {
        console.error("❌ Retirement Controller Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};