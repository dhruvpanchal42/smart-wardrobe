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
            return cb(new Error("Only jpeg, jpg, png files are allowed"), false);
        }
    }
});

// Route to add clothes
router.post('/add-clothes', isLoggedIn, upload.single('image'), [
    check('gender').notEmpty().withMessage('Gender is required.'),
    check('subcategory').notEmpty().withMessage('Subcategory is required.'),
    check('size').notEmpty().withMessage('Size is required.'),
    check('color').notEmpty().withMessage('Color is required.'),
    check('fabric').notEmpty().withMessage('Fabric type is required.'),
    check('occasion').notEmpty().withMessage('Occasion is required.'),
    check('weather').notEmpty().withMessage('Weather type is required.'),
], async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', ')); // Set flash error messages
        return res.redirect('/clothes/add-clothes'); // Redirect if there are validation errors
    }

    if (!req.file) {
        req.flash('error', 'Image is required.'); // Set flash error message
        return res.redirect('/clothes/add-clothes'); // Redirect to add-clothes on error
    }

    const { gender, size, subcategory, color, fabric, occasion, weather } = req.body;

    try {
        const filename = `${Date.now()}_${req.file.originalname}`;
        const file = bucket.file(filename);

        const stream = file.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        stream.on('error', (err) => {
            console.error('Upload to Firebase failed:', err);
            req.flash('error', 'Upload failed, please try again later.'); // Set flash error message
            return res.redirect('/clothes/add-clothes'); // Redirect on error
        });

        stream.on('finish', async () => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`;

            const userId = req.user._id; // Get user ID from session
            const newCloth = new UserCloth({
                userId,
                gender,
                subcategory,
                size,
                color,
                fabric,
                occasion,
                weather,
                image: imageUrl, // Save the Firebase Storage URL in the database
            });

            await newCloth.save(); // Save new clothing item to DB
            req.flash("success", "Clothing item successfully added to your wardrobe."); // Set flash success message
            return res.redirect('/clothes/successpage'); // Redirect on success
        });

        stream.end(req.file.buffer); // Upload the file buffer to Firebase
    } catch (error) {
        console.error('Error adding clothes:', error);
        req.flash('error', 'Server error, please try again later.'); // Set flash error message
        return res.redirect('/clothes/add-clothes'); // Redirect to add-clothes on error
    }
});

// Route to render the add clothes page
router.get('/add-clothes',isLoggedIn, (req, res) => {
    // Get flash messages from session
    const error = req.flash('error');
    const success = req.flash('success');
    
    res.render('add-clothes', { error, success }); // Pass error and success to the view
});
router.get("/successpage",(req,res)=>{
    res.render("successpage")
})

// Route to get outfits based on filters
router.get('/get-outfits', isLoggedIn, async (req, res) => {
    const location = req.query.location;
    const apiKey = process.env.WEATHER_API_KEY;
    const userId = req.user._id; // Get the logged-in user's ID

    // Get the filter values from the query parameters
    const { gender = '', size = '', occasion = '', weather = '', subcategory = '', color = '', fabric = '' } = req.query;

    // Construct the filter conditions based on the provided query parameters
    const filterConditions = {
        userId: userId,
    };

    if (occasion) filterConditions.occasion = occasion;
    if (gender) filterConditions.gender = gender; 
    if (size) filterConditions.size = size; 
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
            gender,
            size
        });
    } catch (error) {
        console.error('Error fetching wardrobe:', error);
        req.flash('error', 'Failed to fetch wardrobe items.'); // Set flash error message
        res.redirect('/intro'); 
    }
});

module.exports = router; 
