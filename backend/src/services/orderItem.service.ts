import { OrderItemModel } from '../models/orderItem.model';
import { AppError } from '../utils/appError';
import {
  CreateOrderItemDTO,
  UpdateOrderItemDTO,
} from '../types/orderItem.types';

export class OrderItemService {
  static async getOrderItems() {
    return OrderItemModel.find();
  }

  static async getOrderItemById(orderItemId: string) {
    const item = await OrderItemModel.findById(orderItemId);
    this.ensureOrderItemExists(item);
    return item;
  }

  static async createOrderItem(data: CreateOrderItemDTO) {
    return OrderItemModel.create(data);
  }

  static async updateOrderItem(orderItemId: string, data: UpdateOrderItemDTO) {
    const item = await OrderItemModel.findByIdAndUpdate(orderItemId, data, {
      new: true,
    });
    this.ensureOrderItemExists(item);

    return item;
  }

  static async deleteOrderItem(orderItemId: string) {
    const item = await OrderItemModel.findByIdAndDelete(orderItemId);
    this.ensureOrderItemExists(item);
  }

  private static ensureOrderItemExists(item: any): void {
    if (!item) {
      throw new AppError('Order item not found', 404);
    }
  }
}
