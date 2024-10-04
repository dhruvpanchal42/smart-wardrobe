const multer = require('multer');
const path = require('path');
const express = require('express');
const { check, validationResult } = require('express-validator');
const isLoggedIn = require('../middlewares/isLoggedIn');
const UserCloth = require('../models/userclothmodel');
const { bucket } = require('../config/firebase'); // Import bucket from the firebase.js
const router = express.Router();

// Use memory storage for multer
const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage to handle file uploads in memory
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

// Route to add clothes
router.post('/add-clothes', isLoggedIn, upload.single('image'), [
    check('name').notEmpty().withMessage('Clothing name is required.'),
    check('category').notEmpty().withMessage('Category is required.'),
    check('subcategory').notEmpty().withMessage('Subcategory is required.'),
    check('color').notEmpty().withMessage('Color is required.'),
    check('fabric').notEmpty().withMessage('Fabric type is required.'),
    check('occasion').notEmpty().withMessage('Occasion is required.'),
    check('weather').notEmpty().withMessage('Weather type is required.'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', ')); // Set flash error messages
        return res.redirect('/add-clothes'); // Redirect to add-clothes on error
    }

    const { name, category, subcategory, color, fabric, occasion, weather } = req.body;

    if (!req.file) {
        req.flash('error', 'Image is required.'); // Set flash error message
        return res.redirect('/add-clothes'); // Redirect to add-clothes on error
    }

    try {
        // Create a unique file name for Firebase Storage
        const filename = `${Date.now()}_${req.file.originalname}`;
        const file = bucket.file(filename);

        // Upload the file to Firebase Storage
        const stream = file.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        stream.on('error', (err) => {
            console.error('Upload to Firebase failed:', err);
            req.flash('error', 'Upload failed, please try again later.'); // Set flash error message
            return res.redirect('/add-clothes'); // Redirect to add-clothes on error
        });

        stream.on('finish', async () => {
            // File upload completed
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`;

            // Save clothing data to your database
            const userId = req.user._id; // Get user ID from session
            const newCloth = new UserCloth({
                userId,
                name,
                category,
                subcategory,
                color,
                fabric,
                occasion, // Save occasion to the database
                weather,  // Save weather to the database
                image: imageUrl, // Save the Firebase Storage URL in the database
            });

            await newCloth.save(); // Save new clothing item to DB
            req.flash('success', 'Clothing item successfully added to your wardrobe.'); // Set flash success message
            res.redirect('/add-clothes'); // Redirect to add-clothes on success
        });

        stream.end(req.file.buffer); // Upload the file buffer to Firebase
    } catch (error) {
        console.error('Error adding clothes:', error);
        req.flash('error', 'Server error, please try again later.'); // Set flash error message
        res.redirect('/add-clothes'); // Redirect to add-clothes on error
    }
});

// Add this route to your clothRouter.js
router.get('/wardrobe', isLoggedIn, async (req, res) => {
    const userId = req.user._id; // Get the logged-in user's ID

    // Get the filter values from the query parameters
    const { occasion = '', weather = '', subcategory = '', color = '', fabric = '' } = req.query;

    // Construct the filter conditions based on the provided query parameters
    const filterConditions = {
        userId: userId,
    };

    if (occasion) filterConditions.occasion = occasion;
    if (weather) filterConditions.weather = weather;
    if (subcategory) filterConditions.subcategory = subcategory;
    if (color) filterConditions.color = color;
    if (fabric) filterConditions.fabric = fabric;

    try {
        const clothes = await UserCloth.find(filterConditions); // Fetch clothes based on filters

        // Render the view and pass the necessary variables
        res.render('get-outfits', {
            clothes,
            occasion,
            weather,
            subcategory,
            color,
            fabric,
        });
    } catch (error) {
        console.error('Error fetching wardrobe:', error);
        req.flash('error', 'Failed to fetch wardrobe items.'); // Set flash error message
        res.redirect('/intro'); 
    }
});

module.exports = router;
