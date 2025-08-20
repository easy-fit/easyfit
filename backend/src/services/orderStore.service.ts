import { OrderModel } from '../models/order.model';
import { OrderItemService } from './orderItem.service';
import { UserService } from './user.service';
import { AppError } from '../utils/appError';
import { OrderNotificationPayload } from '../types/websocket.types';

export class OrderStoreService {
  static async getCompleteOrderData(orderId: string): Promise<OrderNotificationPayload> {
    // Get order without population for performance
    const order = (await OrderModel.findById(orderId).lean()) as any;
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Get order items with optimized population (no store data)
    const orderItems = await OrderItemService.getCompleteOrderData(orderId);

    // Get customer with minimal fields
    const customer = await UserService.getUserById(order.userId.toString());
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    return {
      order: {
        _id: order._id.toString(),
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shipping: {
          address: {
            formatted: order.shipping.address.formatted,
            coordinates: order.shipping.address.coordinates,
          },
          cost: order.shipping.cost,
          type: order.shipping.type,
          tryOnEnabled: order.shipping.tryOnEnabled,
        },
        createdAt: order.createdAt,
      },
      orderItems: orderItems.map((item: any) => ({
        _id: item._id.toString(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        returnStatus: item.returnStatus,
        product: {
          _id: item.variantId.productId._id.toString(),
          title: item.variantId.productId.title,
          category: item.variantId.productId.category,
        },
        variant: {
          _id: item.variantId._id.toString(),
          size: item.variantId.size,
          color: item.variantId.color,
          sku: item.variantId.sku,
        },
      })),
      customer: {
        _id: customer._id.toString(),
        name: customer.name,
        surname: customer.surname,
        email: customer.email,
        address: {
          formatted: customer.address?.formatted || {},
        },
      },
      timestamp: new Date(),
    };
  }
}
