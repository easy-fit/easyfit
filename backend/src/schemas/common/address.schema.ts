import { Schema } from 'mongoose';

export const AddressSchema = new Schema({
  formatted: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
});

export const AddressModel = AddressSchema;
