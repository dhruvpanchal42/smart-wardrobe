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
        enum: ['Cotton', 'Wool', 'Polyester', 'Silk', 'Denim', 'Linen', 'Other'], // Updated fabric types
    },
    occasion: {
        type: String,
        required: true,
        enum: ['Casual', 'Formal', 'Sports', 'Party', 'Business', 'Other'], // Updated occasions
    },
    weather: {
        type: String,
        required: true,
        enum: ['Sunny', 'Rainy', 'Cold', 'Hot', 'All Weather', 'Other'], // Updated weather types
    },
    size: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Unisex', 'Other'], // Added gender options
    },
    image: {
        type: String, // Store the image URL after upload to Firebase
        required: true,
    },
}, {
    timestamps: true, // Automatically create createdAt and updatedAt fields
});

module.exports = mongoose.model("UserCloth", userClothSchema);
