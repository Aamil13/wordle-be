import mongoose, { Schema, Document } from 'mongoose';
import { ILeaderboardEntry, LeaderboardMode } from './leaderboard.interface';

export interface ILeaderboardDocument extends ILeaderboardEntry, Document {}

const LeaderboardSchema = new Schema<ILeaderboardDocument>(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    avatar: { type: String, default: null },
    mode: {
      type: String,
      enum: Object.values(LeaderboardMode),
      required: true,
      index: true,
    },
    score: { type: Number, required: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    rank: { type: Number, required: true },
  },
  { timestamps: true },
);

// Fast reads: "give me daily board for 2025-01-01, sorted by rank"
LeaderboardSchema.index({ mode: 1, date: 1, rank: 1 });

// Upsert guard: one entry per user per mode per day
LeaderboardSchema.index({ userId: 1, mode: 1, date: 1 }, { unique: true });

export const LeaderboardModel = mongoose.model<ILeaderboardDocument>(
  'Leaderboard',
  LeaderboardSchema,
);
