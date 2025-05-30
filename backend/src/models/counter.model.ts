// src/models/counter.model.ts
import { Schema, model, Document } from 'mongoose';

export interface ICounter extends Document {
  _id: string;
  sequenceValue: number;
}

const counterSchema = new Schema<ICounter>({
  _id: {
    type: String,
    required: true,
  },
  sequenceValue: {
    type: Number,
    default: 0,
  },
});

export const Counter = model<ICounter>('Counter', counterSchema);
