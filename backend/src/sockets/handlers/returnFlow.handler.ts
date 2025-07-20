import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket, SocketChannels } from '../../types/websocket.types';
import { OrderStateManager } from '../../services/orderStateManager.service';
import { OrderService } from '../../services/order.service';

interface ReturnPickupConfirmation {
  orderId: string;
  riderId: string;
  confirmed: boolean;
}

interface StoreReturnDelivery {
  orderId: string;
  riderId: string;
}

interface StoreInspectionResult {
  orderId: string;
  storeId: string;
  returnStatus: 'returned_ok' | 'returned_partial' | 'returned_damaged';
  damagedItems?: Array<{
    variantId: string;
    reason: string;
  }>;
}

export class ReturnFlowHandler {
  constructor(private io: SocketIOServer, private channels: SocketChannels) {}

  /**
   * Rider confirms they have collected returned items from customer
   */
  public async handleReturnPickupConfirmation(
    socket: AuthenticatedSocket, 
    data: ReturnPickupConfirmation
  ): Promise<void> {
    if (socket.userRole !== 'rider') {
      socket.emit('error', { message: 'Unauthorized: Only riders can confirm return pickup' });
      return;
    }

    if (socket.riderId !== data.riderId) {
      socket.emit('error', { message: 'Unauthorized: Can only confirm your own pickups' });
      return;
    }

    try {
      if (data.confirmed) {
        // Update order status to returning_to_store
        await OrderStateManager.markReturnPickupComplete(data.orderId, data.riderId);

        // Confirm to rider
        socket.emit('return:pickup_confirmed', {
          type: 'return_pickup_confirmed',
          data: {
            orderId: data.orderId,
            message: 'Return pickup confirmed. Please head back to store.',
            timestamp: new Date(),
          },
        });

        console.log(`Rider ${data.riderId} confirmed return pickup for order ${data.orderId}`);
      }
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to confirm return pickup' });
    }
  }

  /**
   * Rider confirms they have delivered returns back to store
   */
  public async handleStoreReturnDelivery(
    socket: AuthenticatedSocket, 
    data: StoreReturnDelivery
  ): Promise<void> {
    if (socket.userRole !== 'rider') {
      socket.emit('error', { message: 'Unauthorized: Only riders can confirm store delivery' });
      return;
    }

    if (socket.riderId !== data.riderId) {
      socket.emit('error', { message: 'Unauthorized: Can only confirm your own deliveries' });
      return;
    }

    try {
      // Update order status to store_checking_returns
      await OrderStateManager.markReturnsDeliveredToStore(data.orderId);

      // Confirm to rider
      socket.emit('return:store_delivery_confirmed', {
        type: 'return_store_delivery_confirmed',
        data: {
          orderId: data.orderId,
          message: 'Returns delivered to store successfully.',
          timestamp: new Date(),
        },
      });

      console.log(`Rider ${data.riderId} delivered returns to store for order ${data.orderId}`);
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to confirm store delivery' });
    }
  }

  /**
   * Store completes inspection of returned items
   */
  public async handleStoreInspectionResult(
    socket: AuthenticatedSocket, 
    data: StoreInspectionResult
  ): Promise<void> {
    if (socket.userRole !== 'merchant') {
      socket.emit('error', { message: 'Unauthorized: Only merchants can complete inspections' });
      return;
    }

    try {
      const order = await OrderService.getOrderById(data.orderId);
      
      if (!order || order.storeId.toString() !== socket.userId) {
        socket.emit('error', { message: 'Unauthorized: Can only inspect returns for your store' });
        return;
      }

      // Update order to final return status
      await OrderStateManager.markAsReturned(data.orderId, data.returnStatus);

      // If damaged items, notify admin
      if (data.returnStatus === 'returned_damaged' && data.damagedItems) {
        this.io.to(this.channels.ADMIN_DASHBOARD).emit('return:damaged_items_reported', {
          type: 'return_damaged_items_reported',
          data: {
            orderId: data.orderId,
            storeId: data.storeId,
            damagedItems: data.damagedItems,
            timestamp: new Date(),
          },
        });
      }

      // Confirm to store
      socket.emit('return:inspection_completed', {
        type: 'return_inspection_completed',
        data: {
          orderId: data.orderId,
          returnStatus: data.returnStatus,
          message: 'Return inspection completed successfully.',
          timestamp: new Date(),
        },
      });

      console.log(`Store inspection completed for order ${data.orderId}: ${data.returnStatus}`);
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to complete inspection' });
    }
  }
}