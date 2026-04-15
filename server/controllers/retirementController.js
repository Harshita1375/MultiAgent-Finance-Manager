const Expense = require('../models/Expense');
const RetirementPlan = require('../models/RetirementPlan');

exports.getRetirementAnalysis = async (req, res) => {
    try {
        const userId = req.user.id;

        // 🔹 Get plan
        let plan = await RetirementPlan.findOne({ user: userId });

        // 🔹 Fetch expenses
        const expenses = await Expense.find({ user: userId });

        console.log("🧾 Expenses:", expenses);

        // ✅ STEP 1: If NO expenses → ask frontend to show form
        if (!expenses || expenses.length === 0) {
            return res.json({
                needsInput: true,   // 👈 IMPORTANT FLAG
                message: "No expense data found"
            });
        }

        // 🔹 If no plan → use frontend input
        if (!plan) {
    const { currentAge, targetAge, inflationRate, expectedReturns } = req.body || {};

    // ❌ If no input → ask frontend
    if (!currentAge) {
        return res.status(400).json({ message: "PLAN_REQUIRED" });
    }

    // ✅ Create and save plan
    plan = new RetirementPlan({
        user: userId,
        currentAge,
        targetAge,
        inflationRate,
        expectedReturns
    });

    await plan.save();

    console.log("✅ New retirement plan created");
}

        // 🔹 Calculate Needs/Wants
        let totalNeeds = 0;
        let totalWants = 0;

        expenses.forEach(e => {
            const category = e.category.toLowerCase();

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

        // 🔹 Extract plan values
        const { currentAge, targetAge, inflationRate, expectedReturns } = plan;

        const yearsToRetirement = targetAge - currentAge;

        if (yearsToRetirement <= 0) {
            return res.status(400).json({ message: "Invalid age values." });
        }

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

        const currentMonthlySavings = 0;
        const shortfall = monthlyNeeded - currentMonthlySavings;

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

        // ✅ Normal response
        return res.json({
            needsInput: false,
            analysis,
            currentMonthlySavings
        });

    } catch (err) {
        console.error("❌ Retirement Controller Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};