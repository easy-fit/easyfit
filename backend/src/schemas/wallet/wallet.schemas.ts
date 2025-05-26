import { Schema } from 'mongoose';

export const PayoutMethodSchema = new Schema({
  type: {
    type: String,
    enum: ['cbu', 'cvu', 'alias'],
    required: true,
  },
  value: { type: String, required: true },
});
