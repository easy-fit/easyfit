import { Schema } from 'mongoose';

export const AddressSchema = new Schema({
  formatted: {
    street: { type: String, required: true },
    streetNumber: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
});

export const AddressModel = AddressSchema;
