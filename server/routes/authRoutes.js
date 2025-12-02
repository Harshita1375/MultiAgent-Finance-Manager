const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); 
const User = require('../models/User');     
const { register, login } = require('../controllers/authController');

router.post('/register', register);

router.post('/login', login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/', session: false }), 
    (req, res) => {
        const payload = { user: { id: req.user.id } };
        
        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }, 
            (err, token) => {
                if (err) throw err;
                res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
            }
        );
    }
);

router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;