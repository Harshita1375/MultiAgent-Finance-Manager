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

        user.profile = {
            ...user.profile, 
            ...req.body,     
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