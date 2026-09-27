import mongoose, { Schema } from 'mongoose';
import { IWordles } from './wordles.interface';

const WordlesSchema = new Schema<IWordles>(
  {
    word: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 10,
    },
    hint: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    category: {
      type: String,
      trim: true,
      default: 'general',
    },
    timesPlayed: {
      type: Number,
      default: 0,
      min: 0,
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    averageAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
WordlesSchema.index({ word: 1 });
WordlesSchema.index({ difficulty: 1, isActive: 1 });
WordlesSchema.index({ category: 1 });

export const WordlesModel = mongoose.model<IWordles>('Wordles', WordlesSchema);
