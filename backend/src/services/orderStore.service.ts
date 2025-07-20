import { OrderService } from './order.service';
import { OrderItemService } from './orderItem.service';
import { UserService } from './user.service';
import { AppError } from '../utils/appError';
import { OrderNotificationPayload } from '../types/websocket.types';

export class OrderStoreService {
  static async getCompleteOrderData(orderId: string): Promise<OrderNotificationPayload> {
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const orderItems = await OrderItemService.getCompleteOrderData(orderId);

    const customer = (await UserService.getUserById(order.userId.toString())) || ({} as any);

    return {
      order: order,
      orderItems,
      customer: {
        _id: customer._id.toString(),
        name: customer.name,
        surname: customer.surname,
        email: customer.email,
        address: customer.address,
      },
      timestamp: new Date(),
    };
  }
}
