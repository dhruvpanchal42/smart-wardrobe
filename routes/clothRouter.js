const multer = require('multer');
const express = require('express');
const path = require('path');
const fs = require('fs'); // Import fs module
const isLoggedIn = require('../middlewares/isLoggedIn');
const UserCloth = require('../models/userclothmodel'); 
const { check, validationResult } = require('express-validator');

const router = express.Router();

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir); // Create the uploads directory if it doesn't exist
}

// Set up Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Define upload folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to file name
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed.'));
        }
    }
});

// Define the routes
router.post('/add-clothes', isLoggedIn, upload.single('image'), [
    check('name').notEmpty().withMessage('Clothing name is required.'),
    check('category').notEmpty().withMessage('Category is required.'),
    check('subcategory').notEmpty().withMessage('Subcategory is required.'),
    check('color').notEmpty().withMessage('Color is required.'),
    check('fabric').notEmpty().withMessage('Fabric type is required.'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Destructure body data
    const { name, category, subcategory, color, fabric } = req.body;
    const image = req.file ? req.file.path : null; // Ensure the file path is captured

    if (!image) {
        return res.status(400).json({ errors: [{ msg: 'Image is required.' }] });
    }

    const userId = req.user._id; // Get user ID from session

    try {
        const newCloth = new UserCloth({
            userId,
            name,
            category,
            subcategory,
            color,
            fabric,
            image,
        });

        await newCloth.save(); // Save new clothing item to DB
        res.status(201).json({ message: 'Clothing item successfully added to your wardrobe.', cloth: newCloth }); 
    } catch (error) {
        console.error('Error adding clothes:', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
});

module.exports = router; 
