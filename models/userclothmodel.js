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
    image: {
        type: String, // Store the image path uploaded via multer
        required: true, // Ensure that image is required
    },
}, {
    timestamps: true, // Automatically create createdAt and updatedAt fields
});

// Export the model
module.exports = mongoose.model("UserCloth", userClothSchema);
