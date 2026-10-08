import mongoose from 'mongoose';
import logger from '../utils/logger.js';

/**
 * MongoDB Atlas Connection Configuration
 * Includes graceful connection handling and development mode fallback warning.
 */
let isConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/linguachat';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.warn(`MongoDB Connection warning (${error.message}). Running in mock/memory fallback store mode for development.`);
    isConnected = false;
    return null;
  }
};

export const getDBStatus = () => isConnected;
