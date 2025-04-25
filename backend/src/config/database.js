const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Get MongoDB connection string from environment variables or use default local connection
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/kinesiology-center';
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

