import { Server as SocketIOServer } from 'socket.io';
import {
  AuthenticatedSocket,
  SocketChannels,
  OrderNotificationPayload,
  StoreOrderResponse,
  OrderStatusUpdatePayload,
} from '../../types/websocket.types';
import { OrderService } from '../../services/order.service';

export class OrderNotificationHandler {
  constructor(private io: SocketIOServer, private channels: SocketChannels) {}

  // Emit order placed notification to store
  public notifyStoreOfNewOrder(payload: OrderNotificationPayload, storeId: string): void {
    const storeChannel = this.channels.STORE(storeId);

    this.io.to(storeChannel).emit('order:new', {
      type: 'order_placed',
      data: payload,
    });

    // Also notify admin dashboard
    this.io.to(this.channels.ADMIN_DASHBOARD).emit('order:new', {
      type: 'order_placed',
      data: payload,
    });

    console.log(`Order ${payload.order._id} notification sent to store and admin`);
  }

  // Handle store response (accept/reject order) - called via WebSocket
  public async handleStoreResponse(socket: AuthenticatedSocket, response: StoreOrderResponse): Promise<void> {
    if (socket.userRole !== 'merchant') {
      socket.emit('error', {
        message: 'Unauthorized: Only merchants can respond to orders',
      });
      return;
    }

    try {
      await OrderService.handleStoreResponse(response.orderId, response.storeId, response.accepted, response.reason);

      // Send confirmation back to the store
      socket.emit('order:response_confirmed', {
        type: 'response_confirmed',
        data: response,
      });

      console.log(`Store response for order ${response.orderId}: ${response.accepted ? 'ACCEPTED' : 'REJECTED'}`);
    } catch (error: any) {
      socket.emit('error', {
        message: error.message || 'Failed to process store response',
      });
    }
  }

  // Emit order status updates
  public emitOrderStatusUpdate(payload: OrderStatusUpdatePayload): void {
    const orderChannel = this.channels.ORDER(payload.order._id);

    // Notify customer
    this.io.to(orderChannel).emit('order:status_update', {
      type: 'status_update',
      data: payload,
    });

    // Notify admin dashboard
    this.io.to(this.channels.ADMIN_DASHBOARD).emit('order:status_update', {
      type: 'status_update',
      data: payload,
    });

    console.log(`Order ${payload.order._id} status updated: ${payload.previousStatus} -> ${payload.newStatus}`);
  }
}
