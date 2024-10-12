const mongoose = require("mongoose");

const userClothSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
   
   
    subcategory: {
        type: String,
        required: true,
        trim: true,
    },
    color: {
        type: String,
        required: true,
        trim: true,
    },
    fabric: {
        type: String,
        required: true,
        enum: ['Cotton', 'Wool', 'Polyester', 'Silk'], // Limit to specified fabric types
    },
    occasion: {
        type: String,
        enum: ['Casual', 'Formal', 'Sports', 'Party'],
        default: 'Casual',
    },
    weather: {
        type: String,
        enum: ['Sunny', 'Rainy', 'Cold'],
        default: 'Sunny',
    },
    size: {
        type: String,
        required: true,
         // Limit to specified sizes
    },
    gender: {
        type: String,
        required: true,
         // Limit to specified genders
    },
    image: {
        type: String, // Store the image URL after upload to Firebase
        required: true,
    },
}, {
    timestamps: true, // Automatically create createdAt and updatedAt fields
});

module.exports = mongoose.model("UserCloth", userClothSchema);
