const Expense = require('../models/Expense');
const mongoose = require('mongoose');

exports.getPersonalImpact = async (newsArticles, userId) => {
    try {
        // SAFETY CHECK: If no articles or no valid user, return empty early
        if (!newsArticles || newsArticles.length === 0 || !userId) {
            return [];
        }

        // Only search if userId looks like a real MongoDB ID
        const isValidId = mongoose.Types.ObjectId.isValid(userId);
        const expenses = isValidId
            ? await Expense.find({ userId })
            : [{ category: 'Food', amount: 5000 }, { category: 'Fuel', amount: 2000 }];

        const rules = [
            {
                keywords: ['fuel', 'petrol', 'diesel', 'oil'],
                category: 'Fuel',
                impact: 0.12,
                advice: 'Fuel prices may rise. Plan refills smartly.'
            },
            {
                keywords: ['vegetable', 'onion', 'milk', 'grocery', 'wheat'],
                category: 'Food',
                impact: 0.08,
                advice: 'Grocery prices fluctuating. Consider bulk buying.'
            },
            {
                keywords: ['gold', 'silver', 'jewelry'],
                category: 'Investment',
                impact: 0.05,
                advice: 'Precious metals are volatile.'
            },
            {
                keywords: ['bank', 'interest', 'fd', 'loan', 'rbi'],  // 👈 ADD THIS
                category: 'Savings',
                impact: 0.03,
                advice: 'Interest rates changing. Review your savings strategy.'
            },
            {
                keywords: ['property', 'real estate', 'home'],
                category: 'Housing',
                impact: 0.06,
                advice: 'Real estate rules changing. Be cautious with investments.'
            }
        ];

        let personalAlerts = [];

        newsArticles.forEach(article => {
            const content = (article.title + (article.insight || "")).toLowerCase();
            rules.forEach(rule => {
                if (rule.keywords.some(key => content.includes(key))) {
                    const categorySpend = expenses
                        .filter(e => e.category === rule.category)
                        .reduce((sum, e) => sum + e.amount, 0);

                    // For the demo, if categorySpend is 0, let's show a "Potential" alert 
                    // so your UI isn't empty
                    personalAlerts.push({
                        category: rule.category,
                        trend: "Rising",
                        projectedLoss: categorySpend > 0 ? (categorySpend * rule.impact).toFixed(2) : "Calculated on next bill",
                        action: rule.advice
                    });
                }
            });
        });

        return personalAlerts;
    } catch (err) {
        console.error("Impact Controller Error:", err);
        return []; 
    }
};