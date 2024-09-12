const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        minLength: 3,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        default: '', // OAuth users might not have passwords
    },
    isOAuthUser: {
        type: Boolean,
        default: false, // Default is false for non-OAuth users
    },
});

module.exports = mongoose.model("User", userSchema);
