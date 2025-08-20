import { Server as SocketIOServer } from 'socket.io';
import {
  AuthenticatedSocket,
  SocketChannels,
  OrderNotificationPayload,
  StoreOrderResponse,
  OrderStatusUpdatePayload,
} from '../../types/websocket.types';
import { OrderService } from '../../services/order.service';
import { OrderModel } from '../../models/order.model';

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
    if (socket.userRole !== 'merchant' && socket.userRole !== 'manager') {
      socket.emit('error', {
        message: 'Unauthorized: Only merchants and managers can respond to orders',
      });
      return;
    }

    // Validate user has access to the store they're responding for
    const hasStoreAccess = socket.storeIds?.includes(response.storeId) || socket.storeId === response.storeId;
    if (!hasStoreAccess) {
      socket.emit('error', {
        message: 'Unauthorized: You do not have access to this store',
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

  public async handleCustomerJoinOrder(socket: AuthenticatedSocket, data: { orderId: string }): Promise<void> {
    try {
      const { orderId } = data;

      // Verify customer role
      if (socket.userRole !== 'customer') {
        socket.emit('error', { message: 'Only customers can join order channels' });
        return;
      }

      // Verify order exists and belongs to this customer
      const order = await OrderModel.findById(orderId);
      if (!order) {
        socket.emit('error', { message: 'Order not found' });
        return;
      }

      if (order.userId.toString() !== socket.userId) {
        socket.emit('error', { message: 'You do not have permission to access this order' });
        return;
      }

      // Join the order channel
      socket.join(this.channels.ORDER(orderId));

      // Confirm successful join
      socket.emit('customer:joined:order', { orderId, success: true });

      console.log(`Customer ${socket.userId} joined order channel: ${orderId}`);
    } catch (error: any) {
      console.error('Error joining customer to order channel:', error);
      socket.emit('error', { message: 'Failed to join order channel' });
    }
  }

  public async handleCustomerLeaveOrder(socket: AuthenticatedSocket, data: { orderId: string }): Promise<void> {
    try {
      const { orderId } = data;

      // Verify customer role
      if (socket.userRole !== 'customer') {
        socket.emit('error', { message: 'Only customers can leave order channels' });
        return;
      }

      // Leave the order channel
      socket.leave(this.channels.ORDER(orderId));

      // Confirm successful leave
      socket.emit('customer:left:order', { orderId, success: true });

      console.log(`Customer ${socket.userId} left order channel: ${orderId}`);
    } catch (error: any) {
      console.error('Error removing customer from order channel:', error);
      socket.emit('error', { message: 'Failed to leave order channel' });
    }
  }
}
