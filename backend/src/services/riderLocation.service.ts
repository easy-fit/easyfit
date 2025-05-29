import { RiderLocationModel } from '../models/riderLocation.model';
import { AppError } from '../utils/appError';
import { GeoPoint } from '../types/riderLocation.types';

export class RiderLocationService {
  static async createLocation(riderId: string, location: GeoPoint) {
    const exists = await RiderLocationModel.findOne({ riderId });
    if (exists) {
      throw new AppError('Location for this rider already exists', 400);
    }
    return RiderLocationModel.create({ riderId, location });
  }

  static async updateLocation(riderId: string, location: GeoPoint) {
    const updated = await RiderLocationModel.findOneAndUpdate(
      { riderId },
      { location },
      { upsert: true, new: true },
    );
    return updated;
  }

  static async getRiderLocation(riderId: string) {
    const location = await RiderLocationModel.findOne({ riderId });
    if (!location) {
      throw new AppError('Location not found for this rider', 404);
    }
    return location;
  }

  static async getNearbyRiders(
    coordinates: [number, number],
    maxDistanceInMeters: number,
  ) {
    return RiderLocationModel.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates,
          },
          $maxDistance: maxDistanceInMeters,
        },
      },
    });
  }
}
