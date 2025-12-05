const MonthlyRecord = require('../models/MonthlyRecord');
const Notification = require('../models/Notification');
const Expense = require('../models/Expense'); 

exports.setWalletLimit = async (req, res) => {
    try {
        const { month, limit } = req.body;
        const userId = req.user.id;
        
        let record = await MonthlyRecord.findOne({ user: userId, month });
        if (!record) {
            record = new MonthlyRecord({ user: userId, month });
        }

        record.wallet.limit = Number(limit);
        await record.save();
        
        res.json({ msg: "Wallet limit set", wallet: record.wallet });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 2. Quick Spend
exports.spendFromWallet = async (req, res) => {
    try {
        const { amount, category, title } = req.body;
        const userId = req.user.id;
        const currentMonthStr = new Date().toISOString().slice(0, 7);

        let record = await MonthlyRecord.findOne({ user: userId, month: currentMonthStr });
        if (!record || record.wallet.limit === 0) {
            return res.status(400).json({ msg: "Wallet not active. Please set a limit first." });
        }

        const cost = Number(amount);
        record.wallet.spent += cost;
        
        record.wallet.transactions.push({
            title: title || `Quick: ${category}`,
            amount: cost,
            category: category,
            date: new Date()
        });

        await Expense.create({
            user: userId,
            title: title || `Wallet: ${category}`,
            amount: cost,
            category: category,
            type: 'want',
            date: new Date()
        });

        const remaining = record.wallet.limit - record.wallet.spent;

        if (remaining < 0) {
            await Notification.create({
                user: userId,
                title: 'Wallet Overdraft!',
                message: `🛑 You exceeded your daily wallet by ₹${Math.abs(remaining)}.`,
                type: 'danger',
                date: new Date()
            });
        } else if (remaining < (record.wallet.limit * 0.2)) {
             await Notification.create({
                user: userId,
                title: 'Wallet Low',
                message: `⚠️ Only ₹${remaining} left in your wallet.`,
                type: 'warning',
                date: new Date()
            });
        }

        await record.save();
        res.json({ wallet: record.wallet, remaining });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.rolloverWallet = async (req, res) => {
    try {
        const { month } = req.body; 
        const userId = req.user.id;

        const record = await MonthlyRecord.findOne({ user: userId, month });
        if (!record) return res.status(404).json({ msg: "Record not found" });

        const leftover = record.wallet.limit - record.wallet.spent;

        if (leftover > 0) {

            record.savings.cash = (record.savings.cash || 0) + leftover;
            
            await Notification.create({
                user: userId,
                title: 'Wallet Rollover',
                message: `🎉 You saved ₹${leftover} from your wallet! It has been added to your Free Cash/Liquid Savings.`,
                type: 'success',
                date: new Date()
            });
            
            await record.save();
        }
        res.json({ msg: "Rollover complete", saved: leftover });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};