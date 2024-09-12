const mongoose = require('mongoose');
const { MONGODB_URI } = process.env;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
     
      serverSelectionTimeoutMS: 30000, 
      connectTimeoutMS: 30000, 
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit the process with failure code
  }
};

module.exports = connectDB;