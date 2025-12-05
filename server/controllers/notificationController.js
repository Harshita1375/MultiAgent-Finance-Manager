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
        console.error(error);
        return false;
    }
};

const getDailyAverage = (manualExpenses) => {
    if (manualExpenses.length === 0) return 0;
    const total = manualExpenses.reduce((sum, e) => sum + e.amount, 0);
    return total / (new Date().getDate() || 1);
};

exports.generateNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentMonthStr = new Date().toISOString().slice(0, 7);
        const today = new Date();
        const dayOfMonth = today.getDate();

        const record = await MonthlyRecord.findOne({ user: userId, month: currentMonthStr });
        const [year, month] = currentMonthStr.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const manualExpenses = await Expense.find({ user: userId, date: { $gte: startDate, $lte: endDate } });

        const income = Number(record?.income) || 0;
        if (income === 0) return res.json([]);

        const expenses = record.expenses || {};
        const fixedNeeds = (Number(expenses.rent) || 0) + (Number(expenses.emi) || 0) + 
                           (Number(expenses.grocery) || 0) + (Number(expenses.electricity) || 0);
        
        let variableNeeds = 0;
        let variableWants = 0;
        
        manualExpenses.forEach(exp => {
            const isNeed = ['Groceries', 'Fuel', 'Medical', 'Bills', 'Rent/EMI', 'Education'].includes(exp.category);
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

        const alerts = [];

        if (totalNeeds > (income * 0.6)) {
            if (!await notificationExists(userId, 'High Fixed Costs')) {
                alerts.push({
                    title: 'High Fixed Costs',
                    message: `⚠️ Your 'Needs' are at ${Math.round((totalNeeds/income)*100)}% of income.`,
                    type: 'warning'
                });
            }
        }

        if (totalWants > (income * 0.3)) {
            if (!await notificationExists(userId, 'Overspending Alert')) {
                alerts.push({
                    title: 'Overspending Alert',
                    message: `🚨 You have crossed the 30% limit on Lifestyle expenses.`,
                    type: 'danger'
                });
            }
        }

        if (dayOfMonth > 15 && totalSavings < (income * 0.1)) {
            if (!await notificationExists(userId, 'Savings Lagging')) {
                alerts.push({
                    title: 'Savings Lagging',
                    message: `📉 It's mid-month and you've saved less than 10%.`,
                    type: 'info'
                });
            }
        }

        const dailyAvg = getDailyAverage(manualExpenses);
        const startOfToday = new Date(new Date().setHours(0,0,0,0));
        const spentToday = manualExpenses
            .filter(e => new Date(e.date) >= startOfToday)
            .reduce((sum, e) => sum + e.amount, 0);

        if (dailyAvg > 0 && spentToday > (dailyAvg * 2.5)) {
             if (!await notificationExists(userId, 'Unusual Spending Spike')) {
                alerts.push({
                    title: 'Unusual Spending Spike',
                    message: `📉 You spent ₹${spentToday} today, which is significantly higher than your daily average of ₹${Math.round(dailyAvg)}.`,
                    type: 'warning'
                });
            }
        }

        if (record?.expenses?.subscriptions > 0 && dayOfMonth <= 7) {
            if (!await notificationExists(userId, 'Subscription Reminder')) {
                alerts.push({
                    title: 'Subscription Reminder',
                    message: `📅 Early month reminder: You have allocated ₹${record.expenses.subscriptions} for subscriptions. Check your renewals!`,
                    type: 'info'
                });
            }
        }

        if (today.getHours() > 20 && spentToday === 0) {
            if (!await notificationExists(userId, 'No Spend Day')) {
                alerts.push({
                    title: 'No Spend Day!',
                    message: `🎉 Great job! You haven't recorded any variable expenses today. Keep the streak alive!`,
                    type: 'success'
                });
            }
        }

        const totalFixed = fixedNeeds; 
        const totalAllocated = totalSavings;
        const buffer = income * 0.1;
        const freeCash = Math.max(0, income - totalFixed - totalAllocated - buffer);

        if (freeCash > 5000) {
            if (!await notificationExists(userId, 'Investment Opportunity')) {
                alerts.push({
                    title: 'Investment Opportunity',
                    message: `💰 You have ₹${Math.round(freeCash).toLocaleString()} in free cash! The Saving Agent has found new trading plans for you.`,
                    type: 'success'
                });
            }
        }

        for (let alert of alerts) {
            await Notification.create({ user: userId, ...alert });
        }

        const notifications = await Notification.find({ user: userId }).sort({ date: -1 }).limit(10);
        res.json(notifications);

    } catch (err) {
        console.error(err);
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