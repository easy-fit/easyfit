import { OrderModel } from '../models/order.model';
import { AppError } from '../utils/appError';
import { UpdateOrderDTO } from '../types/order.types';
import { OrderItemService } from './orderItem.service';

export class OrderService {
  static async getOrders() {
    return OrderModel.find();
  }

  static async getOrderById(orderId: string) {
    const order = await OrderModel.findById(orderId);
    this.ensureOrderExists(order);
    return order;
  }

  static async createOrder(
    userId: string,
    sessionId: string,
    cartItems: any[],
    total: number,
    shipping: any,
    paymentType: string,
    externalPaymentId: string,
  ) {
    const deliveryVerificationCode = this.generateDeliveryCode();
    const paymentStatus =
      paymentType === 'hold' ? 'hold_placed' : 'paid_full_debit';

    const orderData = {
      userId,
      total,
      shipping,
      status: 'order_placed',
      paymentId: externalPaymentId,
      paymentStatus,
      deliveryVerification: {
        code: deliveryVerificationCode,
        attempts: {
          made: 0,
          max: 3,
        },
      },
      isStolen: false,
      isActive: true,
    };

    const order = await OrderModel.create(orderData);

    for (const item of cartItems) {
      const orderItemData = {
        orderId: order._id.toString(),
        variantId: item.variantId,
        unitPrice: item.unit_price,
        quantity: item.quantity,
        returnStatus: 'undecided' as const,
      };

      await OrderItemService.createOrderItem(orderItemData);
    }

    return order;
  }

  static async updateOrder(orderId: string, data: UpdateOrderDTO) {
    const order = await OrderModel.findByIdAndUpdate(orderId, data, {
      new: true,
    });
    this.ensureOrderExists(order);

    return order;
  }

  static async deleteOrder(orderId: string) {
    const order = await OrderModel.findByIdAndDelete(orderId);
    this.ensureOrderExists(order);
  }

  private static async ensureNoActiveOrder(userId: string) {
    const existingOrder = await OrderModel.findOne({
      userId,
      isActive: true,
    });

    if (existingOrder) {
      throw new AppError('User already has an active order', 400);
    }
  }

  private static generateDeliveryCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private static ensureOrderExists(order: any): void {
    if (!order) {
      throw new AppError('Order not found', 404);
    }
  }
}
