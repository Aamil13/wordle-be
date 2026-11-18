import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';

const start = async (): Promise<void> => {
  await connectDB();
  await connectRedis();

  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

start();
