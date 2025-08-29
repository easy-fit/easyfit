import { OrderService } from './order.service';
import { OrderItemService } from './orderItem.service';
import { OrderItemModel } from '../models/orderItem.model';
import { OrderModel } from '../models/order.model';
import { OrderStateManager } from './orderStateManager.service';
import { WebSocketService } from './websocket.service';
import { UserService } from './user.service';
import { RiderAssignmentService } from './riderAssignment.service';
import { AppError } from '../utils/appError';
import { TRY_PERIOD_DURATION_BY_DELIVERY_TYPE, TRY_PERIOD_CONSIDERED_STOLEN_AFTER_SECONDS } from '../config/tryPeriod';
import { TryPeriodInfo, ItemDecision } from '../types/tryPeriod.types';

export class TryPeriodManager {
  static async startTryPeriod(orderId: string): Promise<TryPeriodInfo> {
    const order = await OrderService.getOrderByIdInternal(orderId);

    if (order?.status !== 'delivered') {
      throw new AppError('Order must be delivered to start try period', 400);
    }

    const durationInSeconds = TRY_PERIOD_DURATION_BY_DELIVERY_TYPE[order.shipping.type];

    if (durationInSeconds === 0) {
      throw new AppError('Try period not available for this shipping type', 400);
    }

    const now = new Date();
    const endsAt = new Date(now.getTime() + durationInSeconds * 1000);

    const tryPeriodInfo: TryPeriodInfo = {
      isActive: true,
      startedAt: now,
      endsAt,
      duration: durationInSeconds,
      status: 'active',
      exceededTime: 0,
    };

    await OrderModel.findByIdAndUpdate(orderId, {
      tryPeriod: tryPeriodInfo,
    });

    // trigger anyways but no-op if already completed
    setTimeout(async () => {
      await this.handleExpiration(orderId);
    }, durationInSeconds * 1000);

    // trigger anyways but no-op if already completed
    setTimeout(async () => {
      await this.handleStolenThreshold(orderId);
    }, (durationInSeconds + TRY_PERIOD_CONSIDERED_STOLEN_AFTER_SECONDS) * 1000);

    await WebSocketService.emitTryPeriodUpdate({
      orderId,
      type: 'try_period_started',
      tryPeriod: tryPeriodInfo,
      timestamp: now,
    });

    console.log(`Try period started for order ${orderId}, ends at ${endsAt}`);
    return tryPeriodInfo;
  }

  static async saveDecisionsAndFinalize(orderId: string, items: ItemDecision[]): Promise<void> {
    const order = await OrderService.getOrderById(orderId);

    if (!order?.tryPeriod) {
      throw new AppError('No try period found for this order', 400);
    }

    const now = new Date();
    const endsAt = order.tryPeriod.endsAt!;

    const exceededTime = endsAt < now ? Math.floor((now.getTime() - endsAt.getTime()) / 1000) : 0;

    await Promise.all(
      items.map((item) => {
        const returnStatus = item.decision === 'keep' ? 'kept' : 'returned';
        
        // Use orderItemId if provided (for individual items), otherwise fall back to variantId (legacy)
        if (item.orderItemId) {
          return OrderItemModel.findByIdAndUpdate(item.orderItemId, { returnStatus }, { new: true });
        } else {
          return OrderItemModel.findOneAndUpdate({ orderId, variantId: item.variantId }, { returnStatus }, { new: true });
        }
      }),
    );

    await OrderModel.findByIdAndUpdate(orderId, {
      'tryPeriod.exceededTime': exceededTime,
      'tryPeriod.status': 'finalized',
      'tryPeriod.finalizedAt': now,
      'tryPeriod.isActive': false,
    });

    await WebSocketService.emitTryPeriodUpdate({
      orderId,
      type: 'try_period_updated',
      tryPeriod: {
        isActive: false,
        startedAt: order.tryPeriod?.startedAt,
        endsAt: order.tryPeriod?.endsAt,
        duration: order.tryPeriod?.duration,
        status: 'finalized',
        exceededTime,
        finalizedAt: now,
      },
      timestamp: now,
    });

    // Send detailed customer decision info to rider
    await this.notifyRiderOfCustomerDecisions(orderId, items, order);

    await this.finalizeTryPeriod(orderId);

    console.log(`Updated ${items.length} item decisions for order ${orderId}, exceeded time: ${exceededTime}s`);
  }

  static async finalizeTryPeriod(orderId: string): Promise<void> {
    await this.determineOrderFinalStatus(orderId);

    console.log(`Try period finalized for order ${orderId}`);
  }

  private static async notifyRiderOfCustomerDecisions(
    orderId: string,
    items: ItemDecision[],
    order: any,
  ): Promise<void> {
    try {
      const assignment = await RiderAssignmentService.getAssignmentByOrderId(orderId);
      if (!assignment || !assignment.riderId) {
        console.log(`No rider assignment found for order ${orderId}`);
        return;
      }

      const customer = await UserService.getUserById(order.userId.toString());
      if (!customer) {
        console.log(`Customer not found for order ${orderId}`);
        return;
      }

      const orderItems = await OrderItemService.getCompleteOrderData(orderId);

      const keepCount = items.filter((item) => item.decision === 'keep').length;
      const returnCount = items.filter((item) => item.decision === 'return').length;

      const itemsWithDecisions = orderItems.map((orderItem: any) => {
        const decision = items.find((item) => item.variantId === orderItem.variantId._id.toString());
        const product = orderItem.variantId.productId;
        const variant = orderItem.variantId;

        // Get the first image (lowest order) or fallback
        const firstImage =
          variant.images && variant.images.length > 0
            ? variant.images.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))[0]
            : null;

        return {
          _id: orderItem._id.toString(),
          productName: product?.title || 'Producto',
          variantInfo: variant?.size || 'N/A',
          quantity: orderItem.quantity,
          decision: decision?.decision || 'keep',
          decisionLabel: decision?.decision === 'keep' ? 'Se queda' : 'Devuelve',
          image: firstImage
            ? {
                key: firstImage.key,
                altText: firstImage.altText || product?.title || 'Producto',
              }
            : null,
        };
      });

      WebSocketService.getIO()
        .to(`rider:${assignment.riderId}`)
        .emit('customer:decisions_completed', {
          type: 'customer_decisions_completed',
          data: {
            orderId,
            customer: {
              name: customer.name,
              surname: customer.surname,
            },
            summary: {
              keepCount,
              returnCount,
              totalItems: items.length,
              status: 'completed',
            },
            items: itemsWithDecisions,
            timestamp: new Date(),
          },
        });
    } catch (error) {
      console.error(`Failed to notify rider of customer decisions for order ${orderId}:`, error);
    }
  }

  private static async determineOrderFinalStatus(orderId: string): Promise<void> {
    const orderItems = await OrderItemService.getOrderItemsByOrderId(orderId);

    const keptItems = orderItems.filter((item) => item.returnStatus === 'kept');
    const returnedItems = orderItems.filter((item) => item.returnStatus === 'returned');

    if (keptItems.length === orderItems.length) {
      // All items kept - order complete
      await OrderStateManager.transitionOrderStatus(orderId, 'purchased');
      console.log(`Order ${orderId} completed: all items purchased`);
    } else {
      // Has returns - start return flow
      await OrderStateManager.transitionOrderStatus(orderId, 'awaiting_return_pickup');
      console.log(`Order ${orderId} starting return flow: ${returnedItems.length} items to return`);
    }
  }

  static async handleExpiration(orderId: string): Promise<void> {
    const order = await OrderService.getOrderById(orderId);

    if (!order?.tryPeriod || order.tryPeriod.status !== 'active') {
      return;
    }

    await OrderModel.findByIdAndUpdate(orderId, {
      'tryPeriod.status': 'expired',
    });

    await WebSocketService.emitTryPeriodUpdate({
      orderId,
      type: 'try_period_expired',
      tryPeriod: {
        isActive: order.tryPeriod?.isActive || false,
        startedAt: order.tryPeriod?.startedAt,
        endsAt: order.tryPeriod?.endsAt,
        duration: order.tryPeriod?.duration,
        status: 'expired',
        exceededTime: order.tryPeriod?.exceededTime || 0,
        finalizedAt: order.tryPeriod?.finalizedAt,
      },
      timestamp: new Date(),
    });

    console.log(`Try period expired for order ${orderId} - now counting exceeded time until stolen threshold`);
  }

  static async handleStolenThreshold(orderId: string): Promise<void> {
    const order = await OrderService.getOrderById(orderId);

    if (!order?.tryPeriod || order.tryPeriod.status === 'finalized') {
      return;
    }

    const now = new Date();
    const endsAt = order.tryPeriod.endsAt!;
    const exceededTime = Math.floor((now.getTime() - endsAt.getTime()) / 1000);

    if (exceededTime >= TRY_PERIOD_CONSIDERED_STOLEN_AFTER_SECONDS) {
      await OrderModel.findByIdAndUpdate(orderId, {
        'tryPeriod.status': 'finalized',
        'tryPeriod.finalizedAt': now,
        'tryPeriod.isActive': false,
        'tryPeriod.exceededTime': exceededTime,
      });

      await OrderItemModel.updateMany({ orderId, returnStatus: 'undecided' }, { returnStatus: 'stolen' });

      await OrderStateManager.transitionOrderStatus(orderId, 'stolen');

      console.log(`Order ${orderId} marked as stolen after ${exceededTime}s exceeded time`);
    }
  }
}
