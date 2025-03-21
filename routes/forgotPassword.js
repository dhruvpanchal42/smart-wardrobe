const express = require('express');
const router = express.Router();
const User = require('../models/usermodel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Forgot Password Page
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { 
        messages: req.flash(),
        email: '' // Pass empty email for initial page load
    });
});

// Handle Forgot Password Request
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email, isOAuthUser: false });

        if (!user) {
            req.flash('error', 'No account found with this email address.');
            return res.redirect('/users/forgot-password');
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store OTP
        otpStore.set(email, { otp, expiry: otpExpiry });

        // Send OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            html: `
                <h1>Password Reset Request</h1>
                <p>Your OTP for password reset is: <strong>${otp}</strong></p>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        req.flash('success', 'OTP has been sent to your email.');
        res.render('forgot-password', { 
            messages: req.flash(),
            email: email // Pass the email to the template
        });
    } catch (error) {
        console.error('Error in forgot password:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/users/forgot-password');
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const storedData = otpStore.get(email);

        if (!storedData) {
            req.flash('error', 'OTP has expired. Please request a new one.');
            return res.redirect('/users/forgot-password');
        }

        if (Date.now() > storedData.expiry) {
            otpStore.delete(email);
            req.flash('error', 'OTP has expired. Please request a new one.');
            return res.redirect('/users/forgot-password');
        }

        if (storedData.otp !== otp) {
            req.flash('error', 'Invalid OTP. Please try again.');
            return res.redirect('/users/forgot-password');
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

        // Update user with reset token
        await User.findOneAndUpdate(
            { email, isOAuthUser: false },
            {
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetTokenExpiry
            }
        );

        // Clear OTP from store
        otpStore.delete(email);

        // Redirect to reset password page
        res.redirect(`/users/reset-password/${resetToken}`);
    } catch (error) {
        console.error('Error in verify OTP:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/users/forgot-password');
    }
});

// Reset Password Page
router.get('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
            isOAuthUser: false
        });

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/users/forgot-password');
        }

        res.render('reset-password', {
            token: req.params.token,
            messages: req.flash()
        });
    } catch (error) {
        console.error('Error in reset password page:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/users/forgot-password');
    }
});

// Handle Password Reset
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
            isOAuthUser: false
        });

        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/users/forgot-password');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user password and clear reset token
        await User.findOneAndUpdate(
            { _id: user._id },
            {
                password: hashedPassword,
                resetPasswordToken: undefined,
                resetPasswordExpires: undefined
            }
        );

        req.flash('success', 'Your password has been reset successfully.');
        res.redirect('/');
    } catch (error) {
        console.error('Error in reset password:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/users/forgot-password');
    }
});

module.exports = router; 