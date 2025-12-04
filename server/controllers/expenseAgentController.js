const MonthlyRecord = require('../models/MonthlyRecord');

exports.addTransaction = async (req, res) => {
    try {
        const { month, title, amount, category, type } = req.body;
        const userId = req.user.id;
        let record = await MonthlyRecord.findOne({ user: userId, month });
        if (!record) {
            record = new MonthlyRecord({ user: userId, month, transactions: [] });
        }

        record.transactions.push({ title, amount, category, type });
        record.totalNeeds = record.transactions
            .filter(t => t.type === 'need')
            .reduce((sum, t) => sum + t.amount, 0);
            
        record.totalWants = record.transactions
            .filter(t => t.type === 'want')
            .reduce((sum, t) => sum + t.amount, 0);

        await record.save();

        const analysis = analyzeSpending(record);
        
        res.json({ 
            msg: "Expense Added", 
            record, 
            agentAlert: analysis 
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// The Brain of the Expense Agent
const analyzeSpending = (record) => {
    const totalSpent = record.totalNeeds + record.totalWants;
    const income = record.income || 1; 

    let alerts = [];

    if (record.totalNeeds > (income * 0.60)) {
        alerts.push({
            level: 'warning',
            message: `⚠️ Your 'Needs' are high (${Math.round((record.totalNeeds/income)*100)}% of income). Review fixed costs like Rent/EMI.`
        });
    }

    if (record.totalWants > (income * 0.30)) {
        alerts.push({
            level: 'danger',
            message: `🚨 You are overspending on 'Wants' (${Math.round((record.totalWants/income)*100)}% of income). Suggested limit: ₹${Math.round(income * 0.3)}`
        });
    }

    const impulseCategories = ['Shopping', 'Entertainment', 'Dining Out'];
    const recentImpulseBuys = record.transactions.filter(t => 
        t.type === 'want' && impulseCategories.includes(t.category)
    );

    const impulseTotal = recentImpulseBuys.reduce((sum, t) => sum + t.amount, 0);
    
    if (impulseTotal > (income * 0.10)) {
        alerts.push({
            level: 'warning',
            message: `You spent ₹${impulseTotal} on impulse categories this month. Try a "No Spend Weekend" to recover.`
        });
    }

    return alerts.length > 0 ? alerts : null;
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { month, transactionId } = req.body;
        let record = await MonthlyRecord.findOne({ user: req.user.id, month });

        record.transactions = record.transactions.filter(t => t._id.toString() !== transactionId);

        record.totalNeeds = record.transactions.filter(t => t.type === 'need').reduce((sum, t) => sum + t.amount, 0);
        record.totalWants = record.transactions.filter(t => t.type === 'want').reduce((sum, t) => sum + t.amount, 0);

        await record.save();
        res.json(record);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};