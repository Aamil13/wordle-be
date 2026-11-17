export enum LeaderboardMode {
  DAILY = 'daily',
  INFINITE = 'infinite',
}

/**
 * One row stored in MongoDB (historical snapshot per day)
 */
export interface ILeaderboardEntry {
  userId: string;
  userName: string;
  avatar?: string | null;
  mode: LeaderboardMode;
  score: number; // guesses (daily) | correctGuesses (infinite)
  date: string; // YYYY-MM-DD  — the day this entry belongs to
  rank: number;
  createdAt?: Date;
}

/**
 * Shape returned to the client for a single leaderboard row
 */
export interface ILeaderboardRow {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string | null;
  score: number;
  /**
   * daily   → number of guesses (lower = better)
   * infinite → correctGuesses (higher = better)
   */
}

export interface IGetLeaderboardParams {
  mode: LeaderboardMode;
  limit?: number;
  date?: string; // YYYY-MM-DD  — omit for today / live Redis data
}
