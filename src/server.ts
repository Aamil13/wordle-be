import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { connectDB } from './config/db';
import { resetAllDailyPlayed } from './modules/daily/daily.service';

/**
 * Schedules the daily-reset job to run at 00:05 every day.
 * Waits until the next 00:05 occurrence, then repeats every 24 hours.
 */
const scheduleDailyReset = (): void => {
  const scheduleNext = () => {
    const now = new Date();

    // Next 00:05 UTC
    const next = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 5, 0, 0),
    );

    // If 00:05 has already passed today, target tomorrow
    if (next <= now) {
      next.setUTCDate(next.getUTCDate() + 1);
    }

    const msUntilNext = next.getTime() - now.getTime();

    setTimeout(async () => {
      try {
        await resetAllDailyPlayed();
        logger.info('Daily reset complete — dailyPlayedToday set to false for all users');
      } catch (err) {
        logger.error('Daily reset failed', err);
      }
      // Schedule the next occurrence (24 h later)
      scheduleNext();
    }, msUntilNext);

    logger.info(`Next daily reset scheduled at ${next.toUTCString()}`);
  };

  scheduleNext();
};

const start = async (): Promise<void> => {
  await connectDB(); // Connect to DB first
  scheduleDailyReset();
  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });
};

start();
