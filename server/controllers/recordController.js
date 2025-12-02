const MonthlyRecord = require('../models/MonthlyRecord');

exports.saveMonthlyRecord = async (req, res) => {
    try {
        const { month, income, expenses, savings, notes } = req.body;

        let record = await MonthlyRecord.findOneAndUpdate(
            { user: req.user.id, month: month },
            { income, expenses, savings, notes },
            { new: true, upsert: true } 
        );

        res.json(record);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMonthlyRecord = async (req, res) => {
    try {
        const { month } = req.query; 
        const record = await MonthlyRecord.findOne({ user: req.user.id, month });
        
        if (!record) return res.status(200).json({}); 
        res.json(record);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getAllHistory = async (req, res) => {
    try {
        const records = await MonthlyRecord.find({ user: req.user.id }).sort({ month: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};