const Notification = require('../models/Notification');
const MonthlyRecord = require('../models/MonthlyRecord');
const Expense = require('../models/Expense');

const notificationExists = async (userId, title) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        
        const exists = await Notification.findOne({
            user: userId,
            title: title,
            date: { $gte: startOfDay }
        });
        return !!exists;
    } catch (error) {
        console.error("Check Exists Error:", error);
        return false;
    }
};

exports.generateNotifications = async (req, res) => {
    try {
        console.log("🔔 Generating Notifications..."); // Debug Log
        
        // 1. Check User
        if (!req.user || !req.user.id) {
            console.error("❌ No User ID found in request");
            return res.status(401).json({ msg: "User not authenticated" });
        }
        const userId = req.user.id;

        const currentMonthStr = new Date().toISOString().slice(0, 7); // "2025-12"
        const dayOfMonth = new Date().getDate();

        // 2. Fetch Monthly Record
        console.log(`🔍 Finding record for ${currentMonthStr}`);
        const record = await MonthlyRecord.findOne({ user: userId, month: currentMonthStr });
        
        if (!record) {
            console.log("⚠️ No monthly record found.");
            return res.json([]); // Return empty array instead of message object to prevent frontend map error
        }

        // 3. Fetch Manual Expenses
        console.log("🔍 Fetching manual expenses...");
        const [year, month] = currentMonthStr.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        
        const manualExpenses = await Expense.find({ 
            user: userId, 
            date: { $gte: startDate, $lte: endDate } 
        });

        // 4. Calculate Totals
        const income = Number(record.income) || 0;
        if (income === 0) return res.json([]);

        // Safe Access to Expenses
        const expenses = record.expenses || {};
        const fixedNeeds = (Number(expenses.rent) || 0) + (Number(expenses.emi) || 0) + 
                           (Number(expenses.grocery) || 0) + (Number(expenses.electricity) || 0);
        
        let variableNeeds = 0;
        let variableWants = 0;
        
        manualExpenses.forEach(exp => {
            const isNeed = ['Groceries', 'Fuel', 'Medical', 'Bills', 'Rent/EMI', 'Education'].includes(exp.category);
            // Check 'type' property first, fallback to category list
            if (exp.type === 'need' || isNeed) {
                variableNeeds += Number(exp.amount) || 0;
            } else {
                variableWants += Number(exp.amount) || 0;
            }
        });

        const totalNeeds = fixedNeeds + variableNeeds;
        const totalWants = variableWants + (Number(expenses.subscriptions) || 0) + (Number(expenses.partyBudget) || 0);
        
        const savings = record.savings || {};
        const totalSavings = (Number(savings.sip) || 0) + (Number(savings.fdRd) || 0) + (Number(savings.gold) || 0);

        console.log(`📊 Analysis: Needs: ${totalNeeds}, Wants: ${totalWants}, Savings: ${totalSavings}`);

        // 5. Generate Alerts
        const alerts = [];

        // Needs Check
        if (totalNeeds > (income * 0.6)) {
            if (!await notificationExists(userId, 'High Fixed Costs')) {
                alerts.push({
                    title: 'High Fixed Costs',
                    message: `⚠️ Your 'Needs' are at ${Math.round((totalNeeds/income)*100)}% of income.`,
                    type: 'warning'
                });
            }
        }

        // Wants Check
        if (totalWants > (income * 0.3)) {
            if (!await notificationExists(userId, 'Overspending Alert')) {
                alerts.push({
                    title: 'Overspending Alert',
                    message: `🚨 You have crossed the 30% limit on Lifestyle expenses.`,
                    type: 'danger'
                });
            }
        }

        // Savings Check
        if (dayOfMonth > 15 && totalSavings < (income * 0.1)) {
            if (!await notificationExists(userId, 'Savings Lagging')) {
                alerts.push({
                    title: 'Savings Lagging',
                    message: `📉 It's mid-month and you've saved less than 10%.`,
                    type: 'info'
                });
            }
        }

        // 6. Save and Return
        for (let alert of alerts) {
            await Notification.create({
                user: userId,
                title: alert.title,
                message: alert.message,
                type: alert.type,
                date: new Date()
            });
        }

        const notifications = await Notification.find({ user: userId }).sort({ date: -1 }).limit(10);
        console.log(`✅ Success! Returning ${notifications.length} notifications.`);
        res.json(notifications);

    } catch (err) {
        console.error("❌ CRITICAL ERROR in Generate Notifications:", err); // This prints the real error to your terminal
        res.status(500).send('Server Error');
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort({ date: -1 }).limit(20);
        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.markRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id }, { $set: { isRead: true } });
        res.json({ msg: 'All marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};