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

// Add this helper at the top if not present
const getDailyAverage = (manualExpenses) => {
    if (manualExpenses.length === 0) return 0;
    const total = manualExpenses.reduce((sum, e) => sum + e.amount, 0);
    // Rough estimate: divide total by day of month (e.g., total / 15th)
    return total / (new Date().getDate() || 1);
};

exports.generateNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentMonthStr = new Date().toISOString().slice(0, 7);
        const today = new Date();
        const dayOfMonth = today.getDate();

        // 1. Fetch Basic Data
        const record = await MonthlyRecord.findOne({ user: userId, month: currentMonthStr });
        const [year, month] = currentMonthStr.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const manualExpenses = await Expense.find({ user: userId, date: { $gte: startDate, $lte: endDate } });

        const income = Number(record?.income) || 0;
        const alerts = [];

        // ... [Keep your existing Needs/Wants/Savings logic here] ...

        // --- NEW LOGIC START ---

        // 1. 📈 Spending Spike Alert
        // If you spent more today than 2x your daily average
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

        // 2. 🗓️ Subscription Reminder (Simulated for 1st-5th of month)
        // Checks if you have a "subscriptions" budget set in profile
        if (record?.expenses?.subscriptions > 0 && dayOfMonth <= 7) {
            if (!await notificationExists(userId, 'Subscription Reminder')) {
                alerts.push({
                    title: 'Subscription Reminder',
                    message: `📅 Early month reminder: You have allocated ₹${record.expenses.subscriptions} for subscriptions. Check your renewals!`,
                    type: 'info'
                });
            }
        }

        // 3. 🏆 "No Spend Day" Achievement
        // If it's late in the day (e.g., after 8 PM) and spentToday is 0
        if (today.getHours() > 20 && spentToday === 0) {
            if (!await notificationExists(userId, 'No Spend Day')) {
                alerts.push({
                    title: 'No Spend Day!',
                    message: `🎉 Great job! You haven't recorded any variable expenses today. Keep the streak alive!`,
                    type: 'success'
                });
            }
        }
        
        // --- NEW LOGIC END ---

        // Save Alerts
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