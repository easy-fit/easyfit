import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket, SocketChannels } from '../../types/websocket.types';
import { RiderLocationService } from '../../services/riderLocation.service';
import { GeoPoint } from '../../types/riderLocation.types';

interface RiderAvailabilityToggle {
  riderId: string;
  isAvailable: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

interface RiderLocationUpdate {
  riderId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export class RiderAvailabilityHandler {
  constructor(private io: SocketIOServer, private channels: SocketChannels) {}

  /**
   * Handle rider availability toggle (go online/offline)
   */
  public async handleAvailabilityToggle(socket: AuthenticatedSocket, toggle: RiderAvailabilityToggle): Promise<void> {
    if (socket.userRole !== 'rider') {
      socket.emit('error', {
        message: 'Unauthorized: Only riders can toggle availability',
      });
      return;
    }

    if (socket.riderId !== toggle.riderId) {
      socket.emit('error', {
        message: 'Unauthorized: Cannot toggle availability for other riders',
      });
      return;
    }

    try {
      // If going online and location is provided, update location first
      if (toggle.isAvailable && toggle.location) {
        const geoPoint: GeoPoint = {
          type: 'Point',
          coordinates: [toggle.location.longitude, toggle.location.latitude], // [lng, lat]
        };
        await RiderLocationService.updateLocation(toggle.riderId, geoPoint);
      }

      // Set availability status
      const updatedLocation = await RiderLocationService.setRiderAvailability(toggle.riderId, toggle.isAvailable);

      // Confirm to rider
      socket.emit('rider:availability_confirmed', {
        type: 'availability_confirmed',
        data: {
          riderId: toggle.riderId,
          isAvailable: toggle.isAvailable,
          location: toggle.location,
          timestamp: new Date(),
        },
      });

      // Notify admin dashboard about rider availability change
      this.io.to(this.channels.ADMIN_DASHBOARD).emit('rider:availability_changed', {
        type: 'rider_availability_changed',
        data: {
          riderId: toggle.riderId,
          isAvailable: toggle.isAvailable,
          location: toggle.location,
          timestamp: new Date(),
        },
      });

      const status = toggle.isAvailable ? 'online' : 'offline';
      console.log(`Rider ${toggle.riderId} went ${status}`);
    } catch (error: any) {
      socket.emit('error', {
        message: error.message || 'Failed to toggle availability',
      });
      console.error('Availability toggle error:', error);
    }
  }

  /**
   * Handle rider location updates while online
   * For continuous location tracking during availability
   */
  public async handleLocationUpdate(socket: AuthenticatedSocket, update: RiderLocationUpdate): Promise<void> {
    if (socket.userRole !== 'rider') {
      socket.emit('error', {
        message: 'Unauthorized: Only riders can update location',
      });
      return;
    }

    if (socket.riderId !== update.riderId) {
      socket.emit('error', {
        message: 'Unauthorized: Cannot update location for other riders',
      });
      return;
    }

    try {
      const geoPoint: GeoPoint = {
        type: 'Point',
        coordinates: [update.longitude, update.latitude], // [lng, lat]
      };

      await RiderLocationService.updateLocation(update.riderId, geoPoint);

      socket.emit('rider:location_confirmed', {
        type: 'location_confirmed',
        data: {
          riderId: update.riderId,
          location: {
            latitude: update.latitude,
            longitude: update.longitude,
          },
          timestamp: new Date(),
        },
      });

      console.log(`Location updated for rider ${update.riderId}: ${update.latitude}, ${update.longitude}`);
    } catch (error: any) {
      socket.emit('error', {
        message: error.message || 'Failed to update location',
      });
      console.error('Rider location update error:', error);
    }
  }

  /**
   * Emit rider availability status to admin dashboard
   * Called from services when availability changes
   */
  public emitAvailabilityUpdate(
    riderId: string,
    isAvailable: boolean,
    location?: { latitude: number; longitude: number },
  ): void {
    this.io.to(this.channels.ADMIN_DASHBOARD).emit('rider:availability_changed', {
      type: 'rider_availability_changed',
      data: {
        riderId,
        isAvailable,
        location,
        timestamp: new Date(),
      },
    });

    const status = isAvailable ? 'online' : 'offline';
    console.log(`Rider availability broadcast: ${riderId} is now ${status}`);
  }
}
