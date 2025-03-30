const express = require('express');
const router = express.Router();

// Login route
router.post('/login', (req, res) => {
    // Add your login logic here
    res.redirect('/dashboard');
});

// Forgot password routes
router.post('/forgot-password', (req, res) => {
    // Add your forgot password logic here
    req.flash('success', 'OTP sent to your email');
    res.render('forgot-password', { messages: req.flash(), email: req.body.email });
});

router.post('/verify-otp', (req, res) => {
    // Add your OTP verification logic here
    res.redirect('/dashboard');
});

module.exports = router; 