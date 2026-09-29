import httpStatus from 'http-status';
import { GameMode } from '../auth/auth.interface';
import { UserModel } from '../auth/auth.model';
import { UpdateStatsParams } from './stats.interface';
import { AppError } from '../../middlewares/error.middleware';
import * as dailyService from '../daily/daily.service';

/**
 * Guess distribution type
 */
type GuessNumber = 1 | 2 | 3 | 4 | 5 | 6;

type IGuessDistribution = Record<GuessNumber, number>;

/**
 * Base game stats
 */
interface IGameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: IGuessDistribution;
}

/**
 * Time attack stats
 */
interface ITimeAttackStats extends IGameStats {
  bestTime: number | null;
  avgTime: number | null;
}

/**
 * Infinite mode stats
 */
interface IInfiniteStats extends IGameStats {
  longestSession: number;
}

/**
 * Default game stats
 */
const getDefaultGameStats = (): IGameStats => ({
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,

  guessDistribution: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  },
});

/**
 * Default time attack stats
 */
const getDefaultTimeAttackStats = (): ITimeAttackStats => ({
  ...getDefaultGameStats(),
  bestTime: null,
  avgTime: null,
});

/**
 * Default infinite stats
 */
const getDefaultInfiniteStats = (): IInfiniteStats => ({
  ...getDefaultGameStats(),
  longestSession: 0,
});

/**
 * Get default stats by mode
 */
const getDefaultStatsForMode = (gameMode: GameMode) => {
  switch (gameMode) {
    case GameMode.TIME_ATTACK:
      return getDefaultTimeAttackStats();

    case GameMode.INFINITE:
      return getDefaultInfiniteStats();

    default:
      return getDefaultGameStats();
  }
};

/**
 * Initialize stats object
 */
const initializeStats = (user: any) => {
  if (!user.stats) {
    user.stats = {
      [GameMode.DAILY]: getDefaultGameStats(),
      [GameMode.TIME_ATTACK]: getDefaultTimeAttackStats(),
      [GameMode.INFINITE]: getDefaultInfiniteStats(),
    };
  }
};

/**
 * Update user stats after game
 */
export const updateStats = async (params: UpdateStatsParams) => {
  const { userId, gameMode, result } = params;

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }

  /**
   * Daily mode guard — block duplicate plays and mark as played
   */
  if (gameMode === GameMode.DAILY) {
    const alreadyPlayed = await dailyService.hasDailyPlayedToday(userId);

    if (alreadyPlayed) {
      throw new AppError(
        'You have already played daily mode today. Come back tomorrow!',
        httpStatus.CONFLICT,
      );
    }

    await dailyService.markDailyPlayed(userId);
  }

  initializeStats(user);

  if (!user.stats[gameMode]) {
    user.stats[gameMode] = getDefaultStatsForMode(gameMode);
  }

  const stats = user.stats[gameMode] as IGameStats | ITimeAttackStats | IInfiniteStats;

  /**
   * Games played
   */
  stats.gamesPlayed += 1;

  /**
   * Won game
   */
  if (result.won) {
    stats.gamesWon += 1;

    /**
     * Update streaks
     */
    stats.currentStreak += 1;

    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);

    /**
     * Guess distribution
     */
    if (result.guesses && result.guesses >= 1 && result.guesses <= 6) {
      const guess = result.guesses as GuessNumber;

      stats.guessDistribution[guess] += 1;
    }



    /**
     * Time attack stats
     */
    if (gameMode === GameMode.TIME_ATTACK && result.timeSeconds) {
      const modeStats = stats as ITimeAttackStats;

      /**
       * Best time
       */
      if (modeStats.bestTime === null || result.timeSeconds < modeStats.bestTime) {
        modeStats.bestTime = result.timeSeconds;
      }

      /**
       * Average time
       */
      const totalWins = modeStats.gamesWon;

      if (modeStats.avgTime !== null) {
        modeStats.avgTime = (modeStats.avgTime * (totalWins - 1) + result.timeSeconds) / totalWins;
      } else {
        modeStats.avgTime = result.timeSeconds;
      }
    }
  } else {
    /**
     * Reset streak
     */
    stats.currentStreak = 0;
  }

  await user.save();

  return {
    success: true,
    stats: user.stats[gameMode],
  };
};

/**
 * Update infinite mode longest session
 */
export const updateInfiniteSession = async (userId: string, correctGuesses: number) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }

  initializeStats(user);

  if (!user.stats[GameMode.INFINITE]) {
    user.stats[GameMode.INFINITE] = getDefaultInfiniteStats();
  }

  const infiniteStats = user.stats[GameMode.INFINITE] as IInfiniteStats;

  if (correctGuesses > infiniteStats.maxStreak) {
    infiniteStats.maxStreak = correctGuesses;


  }
  infiniteStats.currentStreak = correctGuesses
  infiniteStats.gamesPlayed = 1 + infiniteStats.gamesPlayed
   await user.save();
  return {
    success: true,
    maxStreak: infiniteStats.maxStreak,
  };
};

/**
 * Get stats by game mode
 */
export const getStatsByMode = async (userId: string, gameMode: GameMode) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }

  const stats = user.stats?.[gameMode];

  if (!stats) {
    return getDefaultStatsForMode(gameMode);
  }

  const winPercentage =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  return {
    gamesPlayed: stats.gamesPlayed,
    gamesWon: stats.gamesWon,
    currentStreak: stats.currentStreak,
    maxStreak: stats.maxStreak,
    winPercentage,
    guessDistribution: stats.guessDistribution,

    ...(gameMode === GameMode.TIME_ATTACK && {
      bestTime: (stats as ITimeAttackStats).bestTime,
      avgTime: (stats as ITimeAttackStats).avgTime,
    }),

    ...(gameMode === GameMode.INFINITE && {
      longestSession: (stats as IInfiniteStats).longestSession,
    }),
  };
};

/**
 * Get all stats
 */
export const getAllStats = async (userId: string) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }

  return {
    [GameMode.DAILY]: await getStatsByMode(userId, GameMode.DAILY),

    [GameMode.TIME_ATTACK]: await getStatsByMode(userId, GameMode.TIME_ATTACK),

    [GameMode.INFINITE]: await getStatsByMode(userId, GameMode.INFINITE),
  };
};

/**
 * Reset stats
 */
export const resetStats = async (userId: string, gameMode: GameMode) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError('User not found', httpStatus.NOT_FOUND);
  }

  initializeStats(user);

  user.stats[gameMode] = getDefaultStatsForMode(gameMode);

  await user.save();

  return {
    success: true,
    message: `Stats reset for ${gameMode} mode`,
  };
};
