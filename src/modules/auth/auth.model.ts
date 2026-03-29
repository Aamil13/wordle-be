import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, AuthProvider, GameMode } from './auth.interface';

const defaultGuessDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 };

const gameModeStatsSchema = {
  gamesPlayed: { type: Number, default: 0 },
  gamesWon: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 },
  guessDistribution: { type: Map, of: Number, default: defaultGuessDistribution },
};

const UserSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
    },
    provider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
    },
    avatar: {
      type: String,
      default: null,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    stats: {
      [GameMode.DAILY]: {
        ...gameModeStatsSchema,
      },
      [GameMode.TIME_ATTACK]: {
        ...gameModeStatsSchema,
        bestTime: { type: Number, default: null }, // in seconds
        avgTime: { type: Number, default: null },
      },
      [GameMode.INFINITE]: {
        ...gameModeStatsSchema,
        longestSession: { type: Number, default: 0 },
      },
    },

    // Forgot password
    passwordResetToken: { type: String, select: false },
    passwordResetExpiresAt: { type: Date, select: false },

    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
