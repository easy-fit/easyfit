import mongoose from 'mongoose';
import { ENV } from './env';

const DB = ENV.MONGO_URI.replace('<PASSWORD>', ENV.DATABASE_PASSWORD);
export const connectDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
