const express = require('express');
const axios = require('axios');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const UserCloth = require('../models/userclothmodel');
const isLoggedIn = require('../middlewares/isLoggedIn');

const router = express.Router();

// Check if API key is available
if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables');
}

// Initialize Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Route to handle AI-generated content
router.post('/generate-description', isLoggedIn, async (req, res) => {
  const { prompt } = req.body;
  const userId = req.user._id;

  try {
    // Validate prompt
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // Get the user's wardrobe items
    const userWardrobe = await UserCloth.find({ userId });
    
    
    // Create a context about the user's wardrobe
    const wardrobeContext = userWardrobe.map(item => 
      `${item.subcategory} (${item.color}, ${item.fabric}, ${item.occasion}, ${item.weather})`
    ).join(', ');

    // Create a more specific prompt that includes the wardrobe context
    const enhancedPrompt = `Based on my wardrobe which includes: ${wardrobeContext}. ${prompt}`;
    

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate content using the enhanced prompt
    const result = await model.generateContent(enhancedPrompt);
    console.log('Generated content successfully');

    // Send the generated text as the response
    res.status(200).json({ description: result.response.text() });
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Send more detailed error information
    res.status(500).json({ 
      message: 'Failed to generate content', 
      error: error.message,
      details: error.stack
    });
  }
});

module.exports = router;