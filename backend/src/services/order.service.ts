import { OrderModel } from '../models/order.model';
import { AppError } from '../utils/appError';
import { CreateOrderDTO, UpdateOrderDTO } from '../types/order.types';

export class OrderService {
  static async getOrders() {
    return OrderModel.find();
  }

  static async getOrderById(orderId: string) {
    const order = await OrderModel.findById(orderId);
    this.ensureOrderExists(order);
    return order;
  }

  static async createOrder(data: CreateOrderDTO) {
    await this.ensureNoActiveOrder(data.userId);
    return OrderModel.create(data);
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

  private static ensureOrderExists(order: any): void {
    if (!order) {
      throw new AppError('Order not found', 404);
    }
  }
}
