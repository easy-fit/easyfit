import { Types } from 'mongoose';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface RiderLocation {
  riderId: Types.ObjectId;
  location: GeoPoint;
  isAvailable?: boolean;
  updatedAt: Date;
}
