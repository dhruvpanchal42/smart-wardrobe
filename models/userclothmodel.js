const mongoose = require("mongoose");

const userClothSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 1, // Minimum length for the clothing name
    },
    category: {
        type: String,
        required: true,
        enum: ['Men', 'Women', 'Children'], // Limit to specified categories
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
    image: {
        type: String, // Store the image URL after upload to Firebase
        required: true,
    },
}, {
    timestamps: true, // Automatically create createdAt and updatedAt fields
});

module.exports = mongoose.model("UserCloth", userClothSchema);
