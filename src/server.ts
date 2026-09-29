import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { connectDB } from './config/db';

const start = async (): Promise<void> => {
  await connectDB(); // Connect to DB first
  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

start();
