import { OrderItemModel } from '../models/orderItem.model';
import { AppError } from '../utils/appError';
import { CreateOrderItemDTO, UpdateOrderItemDTO } from '../types/orderItem.types';

export class OrderItemService {
  static async getOrderItems() {
    return OrderItemModel.find();
  }

  static async getOrderItemById(orderItemId: string) {
    const item = await OrderItemModel.findById(orderItemId);
    this.ensureOrderItemExists(item);
    return item;
  }

  static async getCompleteOrderData(orderId: string) {
    const orderItems = await OrderItemModel.find({ orderId })
      .populate({
        path: 'variantId',
        select: 'size color images price',
        populate: {
          path: 'productId',
          select: '_id title description category slug',
        },
      })
      .lean();

    if (orderItems.length === 0) {
      throw new AppError('No items found for this order', 404);
    }

    return orderItems;
  }

  static async createOrderItem(data: CreateOrderItemDTO) {
    return OrderItemModel.create(data);
  }

  static async createManyOrderItems(orderId: string, items: any[]) {
    const orderItemData = items.map((item) => ({
      orderId: orderId,
      variantId: item.variantId,
      unitPrice: item.unit_price,
      quantity: item.quantity,
      returnStatus: 'undecided' as const,
    }));
    await OrderItemModel.insertMany(orderItemData);
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

  static async getOrderItemsByOrderId(orderId: string) {
    const items = await OrderItemModel.find({ orderId });
    if (items.length === 0) {
      throw new AppError('No items found for this order', 404);
    }
    return items;
  }

  private static ensureOrderItemExists(item: any): void {
    if (!item) {
      throw new AppError('Order item not found', 404);
    }
  }
}
