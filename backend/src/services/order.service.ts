import { OrderModel } from '../models/order.model';
import { AppError } from '../utils/appError';
import { UpdateOrderDTO } from '../types/order.types';
import { OrderItemService } from './orderItem.service';
import { OrderStoreService } from './orderStore.service';
import { WebSocketService } from './websocket.service';
import { RiderAssignmentOrchestrator } from './riderAssignmentOrchestrator.service';
import { OrderStateManager } from './orderStateManager.service';
import { TryPeriodManager } from './tryPeriodManager.service';
import { PaymentService } from './payment/payment.service';
import { MercadoPagoService } from './payment/mercadoPago.service';

export class OrderService {
  static async getOrders() {
    return OrderModel.find();
  }

  static async getMyOrders(userId: string) {
    return OrderModel.find({ userId })
      .populate({
        path: 'storeId',
        select: 'name customization.logoUrl',
      })
      .select('-deliveryVerification -isStolen -isActive -externalPaymentId')
      .sort({ createdAt: -1 });
  }

  static async getOrderById(orderId: string) {
    const order = await OrderModel.findById(orderId).populate('storeId');
    this.ensureOrderExists(order);
    return order;
  }

  static async createOrder(
    userId: string,
    storeId: string,
    cartItems: any[],
    total: number,
    shipping: any,
    paymentType: string,
    externalPaymentId: string,
  ) {
    const deliveryVerificationCode = this.generateDeliveryCode();
    const paymentStatus = paymentType === 'hold' ? 'hold_placed' : 'paid_full_debit';

    const orderData = {
      userId,
      storeId,
      total,
      shipping,
      status: 'order_placed',
      externalPaymentId,
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
    await OrderItemService.createManyOrderItems(order._id.toString(), cartItems);

    try {
      const orderPayload = await OrderStoreService.getCompleteOrderData(order._id.toString());

      WebSocketService.notifyStoreOfNewOrder(orderPayload, storeId);
    } catch (error) {
      console.error('Failed to send store notification:', error);
      // Don't fail the order creation if WebSocket fails
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

  static async handleStoreResponse(orderId: string, storeId: string, accepted: boolean, reason?: string) {
    const order = await OrderModel.findById(orderId);
    this.ensureOrderExists(order);

    if (order?.status !== 'order_placed') {
      throw new AppError('Order is not in a state to be accepted/rejected', 400);
    }

    // Verify store owns this order
    if (order.storeId.toString() !== storeId) {
      throw new AppError('Store does not have permission to respond to this order', 403);
    }

    const newStatus = accepted ? 'order_accepted' : 'order_canceled';
    const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });

    this.ensureOrderExists(updatedOrder);

    try {
      WebSocketService.emitOrderStatusUpdate({
        order: {
          ...updatedOrder!.toObject(),
        },
        previousStatus: 'order_placed',
        newStatus: newStatus,
        timestamp: new Date(),
        details: { storeResponse: { accepted, reason } },
      });

      if (accepted) {
        RiderAssignmentOrchestrator.assignRiderToOrder(orderId).catch((error) => {
          console.error('Failed to assign rider to order:', error);
        });
      } else {
        await this.processOrderRejectionRefund(orderId, reason);
      }
    } catch (error) {
      console.error('Failed to send order status update:', error);
    }

    return updatedOrder;
  }

  static async deleteOrder(orderId: string) {
    const order = await OrderModel.findByIdAndDelete(orderId);
    this.ensureOrderExists(order);
  }

  static async ensureNoActiveOrder(userId: string) {
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

  static async verifyDeliveryCode(orderId: string, code: string, riderId: string) {
    const order = await OrderModel.findById(orderId);
    this.ensureOrderExists(order);

    if (order?.status !== 'in_transit') {
      return {
        success: false,
        message: 'Order is not ready for delivery verification',
      };
    }

    if (order.deliveryVerification.attempts.made >= order.deliveryVerification.attempts.max) {
      await OrderModel.findByIdAndUpdate(orderId, {
        'deliveryVerification.verifiedAt': new Date(),
        'deliveryVerification.status': 'failed',
      });
      return {
        success: false,
        message: 'Maximum verification attempts exceeded',
      };
    }

    if (order.deliveryVerification.code !== code) {
      await OrderModel.findByIdAndUpdate(orderId, {
        $inc: { 'deliveryVerification.attempts.made': 1 },
      });

      const attemptsRemaining = order.deliveryVerification.attempts.max - order.deliveryVerification.attempts.made - 1;

      return {
        success: false,
        message: 'Invalid delivery code',
        attemptsRemaining,
      };
    }

    await OrderStateManager.markAsDelivered(orderId, riderId);

    const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, {
      'deliveryVerification.verifiedAt': new Date(),
      'deliveryVerification.status': 'verified',
    }).select('-deliveryVerification');

    if (order.shipping.tryOnEnabled) {
      await TryPeriodManager.startTryPeriod(orderId);
    } else {
      await OrderStateManager.markAsPurchased(orderId, 'Simple shipping - no try period');
    }

    return {
      success: true,
      order: updatedOrder,
    };
  }

  private static async processOrderRejectionRefund(orderId: string, reason?: string): Promise<void> {
    try {
      const payment = await PaymentService.getInternalPaymentByOrderId(orderId);

      if (!payment) {
        console.error(`No payment found for order ${orderId} - cannot process refund`);
        return;
      }

      if (payment.type === 'hold') {
        await MercadoPagoService.cancelPayment(payment.externalId);

        await PaymentService.updateInternalPayment(payment._id.toString(), {
          status: 'cancelled',
        });
      } else if (payment.type === 'capture') {
        await MercadoPagoService.refundPayment(payment.externalId);

        await PaymentService.createInternalPayment({
          orderId: payment.orderId,
          userId: payment.userId,
          type: 'refund',
          amount: payment.amount,
          status: 'refunded',
          externalId: payment.externalId,
        });

        await PaymentService.updateInternalPayment(payment._id.toString(), {
          status: 'refunded',
          finalPaymentInfo: {
            settledAt: new Date(),
            capturedAmount: 0,
            refundedAmount: payment.amount,
          },
        });
      }

      WebSocketService.emitOrderStatusUpdate({
        order: { _id: orderId } as any,
        previousStatus: 'order_canceled',
        newStatus: 'order_canceled',
        timestamp: new Date(),
        details: {
          refundProcessed: true,
          paymentType: payment.type,
          storeRejectionReason: reason,
        },
      });
    } catch (error: any) {
      console.error(`Failed to process refund for order ${orderId}:`, error.message);

      try {
        WebSocketService.emitOrderStatusUpdate({
          order: { _id: orderId } as any,
          previousStatus: 'order_canceled',
          newStatus: 'order_canceled',
          timestamp: new Date(),
          details: {
            refundFailed: true,
            error: error.message,
            requiresManualIntervention: true,
          },
        });
      } catch (notificationError) {
        console.error('Failed to send refund error notification:', notificationError);
      }
    }
  }

  private static ensureOrderExists(order: any): void {
    if (!order) {
      throw new AppError('Order not found', 404);
    }
  }
}
