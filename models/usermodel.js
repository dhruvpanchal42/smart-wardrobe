const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        minLength: 3,
        trim: true
    },
    email: {
        type: String,
        unique: true
    },
    password: String,
    
   
   
});

module.exports = mongoose.model("User", userSchema);