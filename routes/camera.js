const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const isLoggedIn = require('../middlewares/isLoggedIn');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, `clothing_${Date.now()}.jpg`);
    }
});

const upload = multer({ storage: storage });

// Camera page route - protected with isLoggedIn middleware
router.get('/', isLoggedIn, (req, res) => {
    res.render('camera', { messages: req.flash() });
});

// Handle image upload and analysis - protected with isLoggedIn middleware
router.post('/analyze', isLoggedIn, async (req, res) => {
    try {
        const { image, analysis } = req.body;
        
        if (!image) {
            return res.status(400).json({
                success: false,
                error: 'No image data provided'
            });
        }

        // Convert base64 to buffer
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate filename
        const filename = `clothing_${Date.now()}.jpg`;
        const filepath = path.join(uploadsDir, filename);

        // Save the image
        fs.writeFileSync(filepath, buffer);

        // Return the analysis results and image path
        res.json({
            success: true,
            analysis: analysis,
            imagePath: `/uploads/${filename}`
        });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({
            success: false,
            error: 'Error processing image'
        });
    }
});

module.exports = router;