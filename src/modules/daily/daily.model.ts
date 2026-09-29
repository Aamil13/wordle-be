import mongoose, { Schema } from 'mongoose';
import { IDailyWord } from './daily.interface';

const DailyWordSchema = new Schema<IDailyWord>(
  {
    wordId: {
      type: Schema.Types.ObjectId,
      ref: 'Wordles',
      required: true,
    },
    word: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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
    date: {
      type: String,       // stored as 'YYYY-MM-DD'
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const DailyWordModel = mongoose.model<IDailyWord>('DailyWord', DailyWordSchema);
