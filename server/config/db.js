const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn('MongoDB unavailable; running in demo mode.');
    console.warn(error.message);
  }
};

module.exports = connectDB;
