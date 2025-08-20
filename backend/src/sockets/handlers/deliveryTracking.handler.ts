import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket, SocketChannels, DeliveryTrackingPayload } from '../../types/websocket.types';
import { OrderStateManager } from '../../services/orderStateManager.service';
import { RiderLocationService } from '../../services/riderLocation.service';
import { DeliveryTrackingService } from '../../services/deliveryTracking.service';

interface LocationUpdate {
  orderId: string;
  riderId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

interface DeliveryStatusUpdate {
  orderId: string;
  riderId: string;
  status: 'picked_up' | 'delivered';
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
  verificationCode?: string;
}

export class DeliveryTrackingHandler {
  constructor(private io: SocketIOServer, private channels: SocketChannels) {}

  public async handleLocationUpdate(socket: AuthenticatedSocket, update: LocationUpdate): Promise<void> {
    if (socket.userRole !== 'rider') {
      socket.emit('error', {
        message: 'Unauthorized: Only riders can send location updates',
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
      await DeliveryTrackingService.updateDeliveryLocation({
        orderId: update.orderId,
        riderId: update.riderId,
        latitude: update.location.latitude,
        longitude: update.location.longitude,
      });

      socket.emit('delivery:location_confirmed', {
        type: 'location_confirmed',
        timestamp: new Date(),
      });
    } catch (error: any) {
      socket.emit('error', {
        message: error.message || 'Failed to update location',
      });
      console.error('Location update error:', error);
    }
  }

  public async handleStatusUpdate(socket: AuthenticatedSocket, update: DeliveryStatusUpdate): Promise<void> {
    if (socket.userRole !== 'rider') {
      socket.emit('error', {
        message: 'Unauthorized: Only riders can update delivery status',
      });
      return;
    }

    if (socket.riderId !== update.riderId) {
      socket.emit('error', {
        message: 'Unauthorized: Cannot update delivery for other riders',
      });
      return;
    }

    try {
      switch (update.status) {
        case 'picked_up':
          await OrderStateManager.markAsPickedUp(update.orderId, update.riderId);
          break;
        case 'delivered':
          socket.emit('info', {
            message: 'For delivery confirmation, please use the delivery verification code endpoint',
          });
          return;
      }

      // Update rider location if provided
      if (update.location) {
        await RiderLocationService.updateLocation(update.riderId, {
          type: 'Point',
          coordinates: [update.location.longitude, update.location.latitude], // [lng, lat]
        });
      }

      socket.emit('delivery:status_confirmed', {
        type: 'status_confirmed',
        data: {
          ...update,
          timestamp: new Date(),
        },
      });

      console.log(`Delivery status update: ${update.status} for order ${update.orderId} by rider ${update.riderId}`);
    } catch (error: any) {
      socket.emit('error', {
        message: error.message || 'Failed to update delivery status',
      });
      console.error('Status update error:', error);
    }
  }

  // Emit delivery tracking updates from services (when order status changes)
  public emitDeliveryUpdate(payload: DeliveryTrackingPayload): void {
    const orderChannel = this.channels.ORDER(payload.orderId);

    // Notify customer
    this.io.to(orderChannel).emit('delivery:tracking_update', {
      type: 'delivery_tracking',
      data: payload,
    });

    // Notify admin dashboard
    this.io.to(this.channels.ADMIN_DASHBOARD).emit('delivery:tracking_update', {
      type: 'delivery_tracking',
      data: payload,
    });

    console.log(`Delivery tracking update for order ${payload.orderId}: ${payload.status}`);
  }
}
