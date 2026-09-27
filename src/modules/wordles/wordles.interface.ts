import { Document } from 'mongoose';

export interface IWordles extends Document {
  word: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timesPlayed: number;
  successRate: number;
  averageAttempts: number;
  attempts: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
