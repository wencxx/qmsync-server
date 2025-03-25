require("dotenv").config()
const mongoose = require('mongoose');

const MONGO_URI = process.env.DB;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1); 
  }
};

module.exports = connectDB;
