import mongoose, { Schema } from 'mongoose';
import { IWordles } from './wordles.interface';

const WordlesSchema = new Schema<IWordles>(
  {
    // define your schema fields here
  },
  {
    timestamps: true,
  }
);

export const WordlesModel = mongoose.model<IWordles>('Wordles', WordlesSchema);
