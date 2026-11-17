import cron from 'node-cron';
import { snapshotToMongo } from './leaderboard.service';
import { logger } from '../../utils/logger';

/**
 * Runs at 23:55 UTC every day.
 * Snapshots the live Redis leaderboard to MongoDB before midnight resets the keys.
 */
export const startLeaderboardCron = (): void => {
  cron.schedule(
    '55 23 * * *',
    async () => {
      logger.info('leaderboard cron: starting daily snapshot');
      await snapshotToMongo();
      logger.info('leaderboard cron: snapshot complete');
    },
    { timezone: 'UTC' },
  );

  logger.info('leaderboard cron scheduled (23:55 UTC daily)');
};
