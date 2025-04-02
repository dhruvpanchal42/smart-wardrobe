const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('../models/usermodel');

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/users/auth/google/callback',
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await userModel.findOne({ email: profile.emails[0].value });
        
        // If the user exists but was registered manually, update isOAuthUser to true
        if (user && !user.isOAuthUser) {
            user.isOAuthUser = true;
            await user.save();
        }

        // If the user doesn't exist, create a new one with OAuth details
        if (!user) {
            user = await userModel.create({
                fullname: profile.displayName,
                email: profile.emails[0].value,
                password: '', // OAuth users won't have a password
                isOAuthUser: true, // Mark as OAuth user
            });
        }

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));

// Serialize and deserialize user for session handling
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        let user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
});
