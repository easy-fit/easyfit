import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket, SocketChannels } from '../../types/websocket.types';
import { OrderStateManager } from '../../services/orderStateManager.service';
import { OrderService } from '../../services/order.service';
import { OrderItemService } from '../../services/orderItem.service';

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
    data: ReturnPickupConfirmation,
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

        // Get detailed return information for rider
        const returnInfo = await this.getReturnPickupInfo(data.orderId);

        // Send detailed return info to rider
        socket.emit('return:pickup_confirmed', {
          type: 'return_pickup_confirmed',
          data: {
            orderId: data.orderId,
            store: returnInfo.store,
            returnItems: returnInfo.returnItems,
            returnCount: returnInfo.returnItems.length,
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
  public async handleStoreReturnDelivery(socket: AuthenticatedSocket, data: StoreReturnDelivery): Promise<void> {
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
  public async handleStoreInspectionResult(socket: AuthenticatedSocket, data: StoreInspectionResult): Promise<void> {
    if (socket.userRole !== 'merchant') {
      socket.emit('error', { message: 'Unauthorized: Only merchants can complete inspections' });
      return;
    }

    // Validate merchant owns the store they're inspecting for
    console.log('Socket storeIds:', socket.storeIds, 'Socket storeId:', socket.storeId, data.storeId);
    const merchantOwnsStore = socket.storeIds?.includes(data.storeId) || socket.storeId === data.storeId;
    if (!merchantOwnsStore) {
      socket.emit('error', { message: 'Unauthorized: You do not own this store' });
      return;
    }

    try {
      const order = await OrderService.getOrderByIdInternal(data.orderId);

      if (!order) {
        socket.emit('error', { message: 'Order not found' });
        return;
      }

      if (order.storeId._id.toString() !== data.storeId.toString()) {
        socket.emit('error', { message: 'Unauthorized: Can only inspect returns for your store' });
        return;
      }

      console.log(`\n=== STORE INSPECTION PROCESSING ===`);
      console.log(`Store ${data.storeId} completing inspection for order ${data.orderId}`);
      console.log(`Overall inspection result: ${data.returnStatus}`);
      console.log(`Number of damaged items: ${data.damagedItems?.length || 0}`);
      
      // Update individual order items based on inspection results
      await OrderItemService.updateReturnStatusAfterInspection(data.orderId, data);
      console.log(`Individual item statuses updated based on inspection results`);

      // Set order to generic completed status (not payment-specific)
      await OrderStateManager.transitionOrderStatus(data.orderId, 'return_completed');

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

      // Notify customer that inspection is completed and order is finalized
      this.io.to(this.channels.ORDER(data.orderId)).emit('order:status_update', {
        type: 'order_status_update',
        data: {
          order: { _id: data.orderId },
          newStatus: 'return_completed',
          previousStatus: 'store_checking_returns',
          message: 'Inspección completada. Tu devolución ha sido procesada.',
          timestamp: new Date(),
        },
      });

      console.log(`Store inspection completed for order ${data.orderId}: ${data.returnStatus}`);
    } catch (error: any) {
      socket.emit('error', { message: error.message || 'Failed to complete inspection' });
    }
  }

  private async getReturnPickupInfo(orderId: string) {
    // Get order with store info
    const order = await OrderService.getOrderByIdInternal(orderId);
    const store = order?.storeId as any;

    // Get order items with full details
    const orderItems = await OrderItemService.getCompleteOrderData(orderId);

    // Filter items marked for return
    const returnItems = orderItems
      .filter((item: any) => item.returnStatus === 'returned')
      .map((item: any) => {
        const product = item.variantId.productId;
        const variant = item.variantId;

        // Get first image
        const firstImage =
          variant.images && variant.images.length > 0
            ? variant.images.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))[0]
            : null;

        return {
          _id: item._id.toString(),
          productName: product?.title || 'Product',
          variantInfo: variant?.size || 'N/A',
          quantity: item.quantity,
          image: firstImage
            ? {
                key: firstImage.key,
                altText: firstImage.altText || product?.title || 'Product',
              }
            : null,
        };
      });

    return {
      store: {
        name: store.name,
        address: {
          formatted: store.address.formatted,
          coordinates: store.address.location.coordinates,
        },
      },
      returnItems,
    };
  }
}
