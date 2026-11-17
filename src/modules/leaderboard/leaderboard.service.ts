import { getRedisClient } from '../../config/redis';
import { logger } from '../../utils/logger';
import { LeaderboardModel } from './leaderboard.model';
import { ILeaderboardRow, LeaderboardMode } from './leaderboard.interface';
import { UserModel } from '../auth/auth.model';

// ─── Redis key helpers ────────────────────────────────────────────────────────

/**
 * Returns today's date string in YYYY-MM-DD (UTC)
 */
const todayUTC = (): string => new Date().toISOString().slice(0, 10);

/**
 * Sorted-set key for live today data, e.g. `leaderboard:daily:2025-07-10`
 */
const liveKey = (mode: LeaderboardMode): string =>
  `leaderboard:${mode}:${todayUTC()}`;

/**
 * Hash key for user display metadata, e.g. `leaderboard:meta:daily:2025-07-10:<userId>`
 */
const metaKey = (mode: LeaderboardMode, userId: string): string =>
  `leaderboard:meta:${mode}:${todayUTC()}:${userId}`;

/**
 * TTL for today's Redis keys: 25 hours so they always outlive the day
 */
const LIVE_TTL_SECONDS = 25 * 60 * 60;

// ─── Score encoding ───────────────────────────────────────────────────────────

/**
 * daily   → lower guesses is better, timestamp breaks ties (earlier wins)
 *           score = guesses * 1_000_000 + unixSeconds  (sort ascending)
 *
 * infinite → more correct guesses is better, timestamp breaks ties (earlier wins)
 *            score = -(correctGuesses * 1_000_000 - unixSeconds) so ascending
 *            ZRANGE still gives us rank 1 first
 */
const encodeScore = (mode: LeaderboardMode, rawScore: number): number => {
  const ts = Math.floor(Date.now() / 1000);
  if (mode === LeaderboardMode.DAILY) {
    return rawScore * 1_000_000 + ts;
  }
  // infinite: negate so ZRANGE (ascending) returns highest scores first
  return -(rawScore * 1_000_000 - ts);
};

const decodeScore = (mode: LeaderboardMode, encoded: number): number => {
  if (mode === LeaderboardMode.DAILY) {
    return Math.floor(encoded / 1_000_000);
  }
  return Math.floor(-encoded / 1_000_000);
};

// ─── Write path ───────────────────────────────────────────────────────────────

/**
 * Called from statsService after a game is saved.
 * Upserts the user's entry in the live Redis sorted set.
 *
 * rawScore:
 *   daily    → guesses (1-6)
 *   infinite → correctGuesses in the session
 */
export const upsertEntry = async (
  userId: string,
  mode: LeaderboardMode,
  rawScore: number,
  userName: string,
  avatar: string | null,
): Promise<void> => {
  try {
    const redis = getRedisClient();
    const key = liveKey(mode);
    const encoded = encodeScore(mode, rawScore);

    // For daily: only keep the best (lowest encoded) score
    // For infinite: only keep the best (most negative = highest raw) score
    const existing = await redis.zscore(key, userId);

    if (existing !== null) {
      const shouldReplace =
        mode === LeaderboardMode.DAILY
          ? encoded < parseFloat(existing)       // fewer guesses is better
          : encoded < parseFloat(existing);       // more correct guesses → more negative → smaller

      if (!shouldReplace) return;
    }

    const pipeline = redis.pipeline();

    pipeline.zadd(key, encoded, userId);
    pipeline.expire(key, LIVE_TTL_SECONDS);

    // Store display metadata in a hash so we don't re-fetch Mongo on every read
    const mk = metaKey(mode, userId);
    pipeline.hset(mk, { userName, avatar: avatar ?? '' });
    pipeline.expire(mk, LIVE_TTL_SECONDS);

    await pipeline.exec();
  } catch (err) {
    // Leaderboard is non-critical — log but never crash the game flow
    logger.error('leaderboard.upsertEntry failed', err);
  }
};

// ─── Read path ────────────────────────────────────────────────────────────────

/**
 * Returns the top-N leaderboard for today (live from Redis).
 * Falls back to a Mongo aggregation if Redis has no data.
 */
export const getLiveLeaderboard = async (
  mode: LeaderboardMode,
  limit = 50,
): Promise<ILeaderboardRow[]> => {
  try {
    const redis = getRedisClient();
    const key = liveKey(mode);

    // zrange with WITHSCORES: stop must be a string in ioredis v6
    const raw = await redis.zrange(key, 0, String(limit - 1), 'WITHSCORES') as string[];

    if (raw.length > 0) {
      return buildRowsFromRedis(raw, mode);
    }
  } catch (err) {
    logger.error('leaderboard.getLiveLeaderboard Redis read failed, falling back', err);
  }

  // ── Cold-start / Redis-down fallback ──
  return fallbackFromMongo(mode, limit);
};

/**
 * Returns a historical leaderboard snapshot from MongoDB for a past date.
 */
export const getHistoricalLeaderboard = async (
  mode: LeaderboardMode,
  date: string,
  limit = 50,
): Promise<ILeaderboardRow[]> => {
  const docs = await LeaderboardModel.find({ mode, date })
    .sort({ rank: 1 })
    .limit(limit)
    .lean();

  return docs.map((d) => ({
    rank: d.rank,
    userId: d.userId,
    userName: d.userName,
    avatar: d.avatar ?? null,
    score: d.score,
  }));
};

// ─── Snapshot (cron) ─────────────────────────────────────────────────────────

/**
 * Reads today's Redis sorted set, assigns ranks, and persists to MongoDB.
 * Called by the cron job at end-of-day (or at midnight).
 */
export const snapshotToMongo = async (): Promise<void> => {
  const date = todayUTC();

  for (const mode of [LeaderboardMode.DAILY, LeaderboardMode.INFINITE]) {
    try {
      const redis = getRedisClient();
      const key = liveKey(mode);

      const raw = await redis.zrange(key, 0, '-1', 'WITHSCORES') as string[];
      if (raw.length === 0) continue;

      const rows = await buildRowsFromRedis(raw, mode);

      const ops = rows.map((row) => ({
        updateOne: {
          filter: { userId: row.userId, mode, date },
          update: {
            $set: {
              userName: row.userName,
              avatar: row.avatar ?? null,
              score: row.score,
              rank: row.rank,
              date,
              mode,
              userId: row.userId,
            },
          },
          upsert: true,
        },
      }));

      await LeaderboardModel.bulkWrite(ops, { ordered: false });
      logger.info(`leaderboard snapshot saved: ${mode} ${date} (${rows.length} entries)`);
    } catch (err) {
      logger.error(`leaderboard.snapshotToMongo failed for ${mode}`, err);
    }
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Turns the flat [userId, score, userId, score …] array from ZRANGE WITHSCORES
 * into ranked ILeaderboardRow[], hydrating display info from Redis meta hashes.
 */
const buildRowsFromRedis = async (
  entries: string[],
  mode: LeaderboardMode,
): Promise<ILeaderboardRow[]> => {
  const redis = getRedisClient();
  const rows: ILeaderboardRow[] = [];

  for (let i = 0; i < entries.length; i += 2) {
    const userId = entries[i];
    const encoded = parseFloat(entries[i + 1]);
    const rawScore = decodeScore(mode, encoded);
    const rank = i / 2 + 1;

    const mk = metaKey(mode, userId);
    const meta = await redis.hgetall(mk);

    // If meta is missing (Redis flush), fall back to Mongo for display info
    let userName = meta?.userName;
    let avatar: string | null = meta?.avatar || null;

    if (!userName) {
      const user = await UserModel.findById(userId).select('userName avatar').lean();
      userName = user?.userName ?? 'Unknown';
      avatar = user?.avatar ?? null;
    }

    rows.push({ rank, userId, userName, avatar, score: rawScore });
  }

  return rows;
};

/**
 * Fallback when Redis is empty: aggregate from UserModel directly.
 * Slower, but ensures the endpoint never returns empty on a cold start.
 */
const fallbackFromMongo = async (
  mode: LeaderboardMode,
  limit: number,
): Promise<ILeaderboardRow[]> => {
  logger.warn(`leaderboard fallback to Mongo aggregation for mode=${mode}`);

  if (mode === LeaderboardMode.DAILY) {
    // Best daily score = fewest guesses among today's winners
    // We approximate using gamesWon desc as a rough proxy
    const users = await UserModel.find({ 'stats.daily.gamesWon': { $gt: 0 } })
      .select('userName avatar stats.daily')
      .sort({ 'stats.daily.gamesWon': -1 })
      .limit(limit)
      .lean();

    return users.map((u, idx) => ({
      rank: idx + 1,
      userId: String(u._id),
      userName: u.userName,
      avatar: u.avatar ?? null,
      score: u.stats?.daily?.gamesWon ?? 0,
    }));
  }

  // infinite: highest longestSession
  const users = await UserModel.find({ 'stats.infinite.maxStreak': { $gt: 0 } })
    .select('userName avatar stats.infinite')
    .sort({ 'stats.infinite.maxStreak': -1 })
    .limit(limit)
    .lean();

  return users.map((u, idx) => ({
    rank: idx + 1,
    userId: String(u._id),
    userName: u.userName,
    avatar: u.avatar ?? null,
    score: u.stats?.infinite?.maxStreak ?? 0,
  }));
};
