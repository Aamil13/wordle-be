import { Document, Types } from 'mongoose';

export interface IDailyWord extends Document {
  wordId: Types.ObjectId;    // reference to Wordles collection
  word: string;              // denormalized for quick access
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  date: string;              // YYYY-MM-DD — unique key for each day
  createdAt?: Date;
  updatedAt?: Date;
}
