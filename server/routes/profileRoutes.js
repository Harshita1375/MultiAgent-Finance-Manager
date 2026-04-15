const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const User = require('../models/User');

router.post('/', auth, async (req, res) => {
    try {
        let user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const { 
            netEarnings, 
            expenses, 
            demographics, 
            lifestyle, 
            savings, 
            insurance, // New field from frontend
            notes 
        } = req.body;
        user.profile = {
            ...user.profile, 
            netEarnings: netEarnings || user.profile.netEarnings,
            expenses: { ...user.profile.expenses, ...expenses },
            demographics: { ...user.profile.demographics, ...demographics },
            lifestyle: { ...user.profile.lifestyle, ...lifestyle },
            savings: { ...user.profile.savings, ...savings },
            // Explicitly saving insurance data
            insurance: {
                life: insurance?.life || 0,
                health: insurance?.health || 0,
                familyHealthInsurance: insurance?.familyHealthInsurance || 0
            },
            notes: notes || user.profile.notes,
            isProfileComplete: true
        };

        await user.save();
        res.json(user.profile); 

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user.profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;