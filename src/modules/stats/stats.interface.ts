import { GameMode } from '../auth/auth.interface';

interface GameResult {
  won: boolean;
  guesses?: number; // Number of guesses taken (1-6), required if won is true
  timeSeconds?: number; // Time taken in seconds, for TIME_ATTACK mode
}

interface UpdateStatsParams {
  userId: string;
  gameMode: GameMode;
  result: GameResult;
}

export { GameResult, UpdateStatsParams };
