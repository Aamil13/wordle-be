import { Document } from 'mongoose';

export interface IWordles extends Document {
  // define your fields here
  createdAt: Date;
  updatedAt: Date;
}

export interface IWordlesInput {
  // define create/update input fields here
}
