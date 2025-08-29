import { RiderAssignmentModel } from '../models/riderAssignment.model';
import { RiderLocationService } from './riderLocation.service';
import { WebSocketService } from './websocket.service';
import { AppError } from '../utils/appError';

export interface LocationUpdateData {
  orderId: string;
  riderId: string;
  latitude: number;
  longitude: number;
}

export interface CurrentDeliveryLocation {
  orderId: string;
  riderId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  lastUpdated: Date;
  estimatedDeliveryTime?: number;
}

export class DeliveryTrackingService {
  static async updateDeliveryLocation(data: LocationUpdateData): Promise<void> {
    const { orderId, riderId, latitude, longitude } = data;

    const assignment = await RiderAssignmentModel.findOne({
      orderId,
      riderId,
      status: { $in: ['assigned', 'picked_up', 'in_transit'] },
    });

    if (!assignment) {
      throw new AppError('Rider not assigned to this order or delivery completed', 403);
    }

    await RiderLocationService.updateLocation(riderId, {
      type: 'Point',
      coordinates: [latitude, longitude],
    });

    WebSocketService.emitDeliveryUpdate({
      orderId: orderId,
      riderId: riderId,
      location: {
        latitude,
        longitude,
      },
      status: 'in_transit',
      timestamp: new Date(),
    });
  }
}
