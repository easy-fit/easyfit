import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket, SocketChannels, RiderCancellationRequest } from '../../types/websocket.types';
import { RiderAssignmentOrchestrator } from '../../services/riderAssignmentOrchestrator.service';
import { OrderService } from '../../services/order.service';

export class RiderCancellationHandler {
  constructor(private io: SocketIOServer, private channels: SocketChannels) {}

  /**
   * Handle rider cancellation of accepted order
   * This allows riders to cancel if they accepted by mistake or have problems
   */
  public async handleRiderCancellation(
    socket: AuthenticatedSocket,
    cancellation: RiderCancellationRequest,
  ): Promise<void> {
    if (socket.userRole !== 'rider') {
      socket.emit('error', {
        message: 'Unauthorized: Only riders can cancel orders',
      });
      return;
    }

    if (socket.riderId !== cancellation.riderId) {
      socket.emit('error', {
        message: 'Unauthorized: Cannot cancel orders for other riders',
      });
      return;
    }

    try {
      // Get order details for notifications
      const order = await OrderService.getOrderByIdInternal(cancellation.orderId);
      if (!order) {
        socket.emit('error', {
          message: 'Order not found',
        });
        return;
      }

      // Only allow cancellation before pickup (rider_assigned status only)
      if (order.status !== 'rider_assigned') {
        socket.emit('error', {
          message: 'Cannot cancel order after pickup. Only orders in rider_assigned status can be cancelled.',
        });
        return;
      }

      // Execute cancellation logic
      await RiderAssignmentOrchestrator.handleRiderCancellation(
        cancellation.orderId,
        cancellation.riderId,
        cancellation.reason,
      );

      // Confirm cancellation to rider
      socket.emit('rider:cancellation_confirmed', {
        type: 'cancellation_confirmed',
        data: {
          orderId: cancellation.orderId,
          riderId: cancellation.riderId,
          message: 'Order cancelled successfully. You are now available for new orders.',
          reason: cancellation.reason,
          timestamp: new Date(),
        },
      });

      // Get store information for notifications
      const storeId = (order.storeId as any)._id?.toString() || order.storeId.toString();

      // Notify store about rider cancellation
      this.io.to(this.channels.STORE(storeId)).emit('rider:order_cancelled', {
        type: 'rider_order_cancelled',
        data: {
          orderId: cancellation.orderId,
          riderId: cancellation.riderId,
          message: 'The assigned rider has cancelled this order. We are finding another rider.',
          reason: cancellation.reason,
          timestamp: new Date(),
        },
      });

      // Notify customer about cancellation and reassignment
      this.io.to(this.channels.ORDER(cancellation.orderId)).emit('order:rider_cancelled', {
        type: 'order_rider_cancelled',
        data: {
          orderId: cancellation.orderId,
          message: 'Your assigned rider had to cancel. We are finding another rider for your order.',
          reassigning: true,
          timestamp: new Date(),
        },
      });

      // Notify admin dashboard
      this.io.to(this.channels.ADMIN_DASHBOARD).emit('rider:cancellation_reported', {
        type: 'rider_cancellation_reported',
        data: {
          orderId: cancellation.orderId,
          riderId: cancellation.riderId,
          reason: cancellation.reason,
          reassigning: true,
          timestamp: new Date(),
        },
      });

      console.log(
        `Rider ${cancellation.riderId} cancelled order ${cancellation.orderId}. Reason: ${
          cancellation.reason || 'Not specified'
        }`,
      );
    } catch (error: any) {
      socket.emit('error', {
        message: error.message || 'Failed to cancel order',
      });
      console.error('Rider cancellation error:', error);
    }
  }

  /**
   * Emit rider cancellation events from services
   * Called when cancellation happens outside of WebSocket context
   */
  public emitRiderCancellation(orderId: string, riderId: string, reason?: string): void {
    // This method can be called from other services if needed
    this.io.to(this.channels.ADMIN_DASHBOARD).emit('rider:cancellation_reported', {
      type: 'rider_cancellation_reported',
      data: {
        orderId,
        riderId,
        reason,
        reassigning: true,
        timestamp: new Date(),
      },
    });

    console.log(`Rider cancellation broadcast: ${riderId} cancelled order ${orderId}`);
  }
}
