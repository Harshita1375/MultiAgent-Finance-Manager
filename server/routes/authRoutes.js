const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

// Google Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/', session: false }), 
    (req, res) => {
        const payload = { user: { id: req.user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
        });
    }
);

module.exports = router;