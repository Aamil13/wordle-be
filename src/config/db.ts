import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection failed', err);
    process.exit(1); // Exit so Docker restarts the container
  }
};
