import { Document } from 'mongoose';

export enum AuthProvider {
  LOCAL = 'local',
  CLERK = 'clerk',
}

export enum GameMode {
  DAILY = 'daily',
  TIME_ATTACK = 'timeAttack',
  INFINITE = 'infinite',
}

export interface IGuessDistribution {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
  '6': number;
}

export interface IGameModeStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: IGuessDistribution;
}

export interface IUser extends Document {
  userName: string;
  email: string;
  password?: string;
  clerkId?: string;
  provider: AuthProvider;
  avatar?: string;
  displayName?: string;

  stats: {
    [GameMode.DAILY]: IGameModeStats;
    [GameMode.TIME_ATTACK]: IGameModeStats & {
      bestTime?: number; // fastest win in seconds
      avgTime?: number; // average solve time
    };
    [GameMode.INFINITE]: IGameModeStats & {
      longestSession?: number; // most words solved in one session
    };
  };

  // Forgot password
  passwordResetToken?: string;
  passwordResetExpiresAt?: Date;

  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRegisterInput {
  userName: string;
  email: string;
  password: string;
  displayName?: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IClerkInput {
  clerkId: string;
  email: string;
  userName: string;
  displayName?: string;
  avatar?: string;
}

export interface IForgotPasswordInput {
  email: string;
}

export interface IResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface IUserResponse {
  id: string;
  userName: string;
  email: string;
  displayName?: string;
  avatar?: string;
  provider: AuthProvider;
  stats: IUser['stats'];
  lastLoginAt: Date;
}
