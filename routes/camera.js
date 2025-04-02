const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const isLoggedIn = require('../middlewares/isLoggedIn');
const { bucket } = require('../config/firebase'); // Import Firebase bucket

// Configure multer to use memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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
        const file = bucket.file(filename);

        // Upload to Firebase Storage
        const stream = file.createWriteStream({
            metadata: {
                contentType: 'image/jpeg',
            },
        });

        stream.on('error', (err) => {
            console.error('Upload to Firebase failed:', err);
            return res.status(500).json({
                success: false,
                error: 'Error uploading image to storage'
            });
        });

        stream.on('finish', async () => {
            // Get the public URL
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`;

            // Return the analysis results and image URL
            res.json({
                success: true,
                analysis: analysis,
                imagePath: imageUrl
            });
        });

        stream.end(buffer);
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({
            success: false,
            error: 'Error processing image'
        });
    }
});

module.exports = router;