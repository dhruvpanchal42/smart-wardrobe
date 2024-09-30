const express = require("express");
const router = express.Router();
const userModel = require("../models/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");
const passport = require("passport");

// Register a new user (Manual JWT)
router.post("/register", async (req, res) => {
    try {
        let { email, password, fullname } = req.body;
        if (!email || !password || !fullname) return res.status(401).send("Enter all the required fields");
        let user = await userModel.findOne({ email: email });

        // If user exists and registered via OAuth, ask them to log in via OAuth
        if (user && user.isOAuthUser) {
            return res.status(409).send("This email is already registered via Google. Please log in using that method.");
        }

        if (user) {
            return res.status(409).send("Account already registered!");
        }

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) return res.status(500).send(err.message);
                let newUser = await userModel.create({
                    email,
                    password: hash,
                    fullname,
                    isOAuthUser: false, // Manual registration
                });
                let token = generateToken(newUser);
                res.cookie("token", token);
                res.redirect("/intro");
            });
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Login a user (Manual JWT)
router.post("/login", async (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) return res.status(401).send("Enter all the required fields");
    let user = await userModel.findOne({ email: email });

    

    if (!user) return res.status(401).send("Email or password is incorrect!");

    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            let token = generateToken(user);
            res.cookie("token", token);
            res.redirect("/intro");
        } else {
            return res.status(401).send("Email or password is incorrect!");
        }
    });
});
router.get("/logout",(req,res)=>{
    res.clearCookie("token")
    res.redirect("/")
})

// OAuth Google login route
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// OAuth Google callback route
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/users/login' }),
    async (req, res) => {
        try {
            let user = await userModel.findOne({ email: req.user.email });

            // If user exists but was registered manually, allow OAuth login and mark them as an OAuth user
            if (user && !user.isOAuthUser) {
                user.isOAuthUser = true; // Update user to mark as OAuth user
                await user.save();
            }

            // If user doesn't exist, create a new OAuth user
            if (!user) {
                user = await userModel.create({
                    fullname: req.user.displayName,
                    email: req.user.emails[0].value,
                    password: '', // OAuth users don't have passwords
                    isOAuthUser: true, // Mark as OAuth user
                });
            }

            // Generate JWT and login
            let token = generateToken(user);
            res.cookie("token", token);
            res.redirect('/intro');
        } catch (error) {
            res.status(500).send("Error logging in with OAuth");
        }
    }
);

// Logout a user
router.get("/logout", (req, res) => {
    req.logout();
    res.clearCookie("token");
    res.redirect("/");
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.get("/intro", (req, res) => {
    res.render("intro");
});

module.exports = router;
