import { OrderService } from './order.service';
import { OrderItemService } from './orderItem.service';
import { OrderItemModel } from '../models/orderItem.model';
import { OrderModel } from '../models/order.model';
import { OrderStateManager } from './orderStateManager.service';
import { WebSocketService } from './websocket.service';
import { AppError } from '../utils/appError';
import { TRY_PERIOD_DURATION_BY_DELIVERY_TYPE, TRY_PERIOD_CONSIDERED_STOLEN_AFTER_SECONDS } from '../config/tryPeriod';
import { TryPeriodInfo, ItemDecision } from '../types/tryPeriod.types';

export class TryPeriodManager {
  static async startTryPeriod(orderId: string): Promise<TryPeriodInfo> {
    const order = await OrderService.getOrderById(orderId);

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
        return OrderItemModel.findOneAndUpdate({ orderId, variantId: item.variantId }, { returnStatus }, { new: true });
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
        ...order.tryPeriod,
        exceededTime,
        status: 'finalized',
        finalizedAt: now,
        isActive: false,
      },
      timestamp: now,
    });

    await this.finalizeTryPeriod(orderId);

    console.log(`Updated ${items.length} item decisions for order ${orderId}, exceeded time: ${exceededTime}s`);
  }

  static async finalizeTryPeriod(orderId: string): Promise<void> {
    await this.determineOrderFinalStatus(orderId);

    console.log(`Try period finalized for order ${orderId}`);
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
        ...order.tryPeriod,
        status: 'expired',
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
