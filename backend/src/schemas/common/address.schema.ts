import { Schema } from 'mongoose';

export const AddressSchema = new Schema({
  formatted: {
    street: { type: String, required: true },
    streetNumber: { type: String, required: true },
    apartment: { type: String }, // Optional: Apartment/Unit number (e.g., "4B", "12A")
    floor: { type: String },     // Optional: Floor number (e.g., "3", "PB")
    building: { type: String },  // Optional: Building name/number (e.g., "Torre A")
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
