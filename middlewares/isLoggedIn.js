const jwt = require("jsonwebtoken");
const userModel = require("../models/usermodel");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = async (req, res, next) => {
    try {
        // Check for either OAuth or JWT token
        const oauthToken = req.cookies.oauthToken;
        const jwtToken = req.cookies.token;

        // If neither token is present, redirect to login
        if (!oauthToken && !jwtToken) {
            req.flash("error", "You need to login first!");
            return res.redirect("/");
        }

        let user;

        // Handle OAuth authentication if OAuth token is present
        if (oauthToken) {
            const ticket = await client.verifyIdToken({
                idToken: oauthToken,
                audience: process.env.GOOGLE_CLIENT_ID, // replace with your Google Client ID
            });
            const payload = ticket.getPayload();
            user = await userModel.findOne({ email: payload.email }).select("-password");

            if (!user) {
                req.flash("error", "User not found with Google account!");
                return res.redirect("/");
            }
        }

        // Handle JWT authentication if JWT token is present
        if (jwtToken && !user) { // Only process JWT if user hasn't been found via OAuth
            if (!process.env.SESSION_SECRET) {
                throw new Error("SESSION_SECRET is not defined in .env file");
            }

            const decoded = jwt.verify(jwtToken, process.env.SESSION_SECRET);
            user = await userModel.findOne({ email: decoded.email }).select("-password");

            if (!user) {
                req.flash("error", "User not found!");
                return res.redirect("/");
            }
        }

        // If a user is authenticated (either OAuth or JWT), attach to req object
        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        req.flash("error", "Authentication failed!");
        res.redirect("/");
    }
};
