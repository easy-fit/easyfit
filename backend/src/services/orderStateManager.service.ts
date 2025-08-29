import { OrderService } from './order.service';
import { OrderItemService } from './orderItem.service';
import { RiderAssignmentService } from './riderAssignment.service';
import { RiderLocationService } from './riderLocation.service';
import { WebSocketService } from './websocket.service';
import { PaymentSettlementService } from './paymentSettlement.service';
import { VariantService } from './variant/variant.service';
import { AppError } from '../utils/appError';
import { OrderStatus } from '../types/order.types';

export class OrderStateManager {
  private static readonly VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    order_placed: ['order_accepted', 'order_canceled'],
    order_accepted: ['rider_assigned', 'pending_rider', 'order_canceled'],
    order_canceled: [],
    pending_rider: ['rider_assigned', 'order_canceled'],
    rider_assigned: ['in_transit', 'pending_rider'], // rider can cancel back to pending
    in_transit: ['delivered'],
    delivered: ['purchased', 'awaiting_return_pickup', 'stolen'],
    awaiting_return_pickup: ['returning_to_store'],
    returning_to_store: ['store_checking_returns'],
    store_checking_returns: ['return_completed'],
    purchased: [],
    return_completed: [],
    stolen: [],
  };

  static async transitionOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    options?: {
      riderId?: string;
      reason?: string;
      details?: any;
      skipValidation?: boolean;
    },
  ) {
    const order = await OrderService.getOrderById(orderId);

    const previousStatus = order?.status;

    if (!options?.skipValidation && !this.isValidTransition(previousStatus || 'order_placed', newStatus)) {
      throw new AppError(`Invalid transition from ${previousStatus} to ${newStatus}`, 400);
    }

    const updatedOrder = await OrderService.updateOrder(orderId, {
      status: newStatus,
    });

    await this.handleStatusChange(orderId, newStatus, options?.riderId);

    // Emit WebSocket notification
    WebSocketService.emitOrderStatusUpdate({
      order: { ...updatedOrder!.toObject() },
      previousStatus: previousStatus || 'order_placed',
      newStatus,
      timestamp: new Date(),
      details: {
        riderId: options?.riderId,
        reason: options?.reason,
        ...options?.details,
      },
    });
    return updatedOrder;
  }

  private static isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
    return this.VALID_TRANSITIONS[from]?.includes(to) || false;
  }

  private static async handleStatusChange(orderId: string, newStatus: OrderStatus, riderId?: string) {
    switch (newStatus) {
      case 'in_transit':
        if (riderId) {
          await RiderAssignmentService.updateAssignmentStatus(orderId, riderId, 'in_transit');
        }
        break;

      case 'delivered':
        if (riderId) {
          await RiderAssignmentService.updateAssignmentStatus(orderId, riderId, 'delivered');
          // Note: Rider remains unavailable until order is completely finished (purchased/returned)
        }
        break;

      case 'order_canceled':
        await this.handleOrderCancellation(orderId);
        break;

      case 'purchased':
      case 'return_completed':
        await this.handleOrderCompletion(orderId);
        break;

      case 'stolen':
        await this.handleStolenOrder(orderId);
        break;

      case 'awaiting_return_pickup':
        await this.handleAwaitingReturnPickup(orderId);
        break;

      case 'returning_to_store':
        await this.handleReturningToStore(orderId);
        break;

      case 'store_checking_returns':
        await this.handleStoreCheckingReturns(orderId);
        break;
    }
  }
  // The order is cancelled by store/admin/system
  private static async handleOrderCancellation(orderId: string) {
    const assignment = await RiderAssignmentService.getAssignmentByOrderId(orderId);
    if (assignment && assignment.status !== 'cancelled') {
      await RiderAssignmentService.updateAssignmentStatus(orderId, assignment.riderId.toString(), 'cancelled');
      await RiderLocationService.setRiderAvailability(assignment.riderId.toString(), true);
    }

    // Restore stock for cancelled orders (restore all items)
    await this.restoreStockForCancelledOrder(orderId);
  }

  private static async handleOrderCompletion(orderId: string) {
    const order = await OrderService.getOrderByIdInternal(orderId);
    const store = order?.storeId as any;

    try {
      let settlementData: any = {
        orderId,
        finalStatus: order?.status === 'purchased' ? 'purchased' : order?.status === 'stolen' ? 'stolen' : 'item_based',
      };

      const settlementResult = await PaymentSettlementService.processPaymentSettlement(settlementData);

      if (settlementResult.success) {
        console.log(`Payment settlement completed for order ${orderId}: ${settlementResult.message}`);
      } else {
        console.error(`Payment settlement failed for order ${orderId}: ${settlementResult.message}`);
      }
    } catch (error: any) {
      console.error(`Payment settlement error for order ${orderId}:`, error.message);
    }

    // Restore stock for returned items
    await this.restoreStockForReturnedItems(orderId);

    // Release the rider - order is completely finished
    const assignment = await RiderAssignmentService.getAssignmentByOrderId(orderId);
    if (assignment && assignment.riderId) {
      await RiderLocationService.setRiderAvailability(assignment.riderId.toString(), true);

      // Notify rider that the order is completed
      WebSocketService.getIO()
        .to(`rider:${assignment.riderId}`)
        .emit('order:completed', {
          type: 'order_completed',
          data: {
            order: {
              id: orderId,
              status: order?.status,
              shipping: {
                type: order?.shipping.type,
                total: order?.shipping.cost,
              },
              store: store.name,
            },
            message: 'Delivery completed successfully! You are now available for new orders.',
            timestamp: new Date(),
          },
        });

      console.log(`Rider ${assignment.riderId} released after order ${orderId} completion (${order?.status})`);
    }

    await OrderService.updateOrder(orderId, {
      isActive: false,
    });
  }

  private static async handleStolenOrder(orderId: string) {
    await OrderService.updateOrder(orderId, {
      status: 'stolen',
      isActive: false,
    });
    await this.handleOrderCancellation(orderId);
  }

  static async markAsPickedUp(orderId: string, riderId: string) {
    return this.transitionOrderStatus(orderId, 'in_transit', { riderId });
  }

  static async markAsDelivered(orderId: string, riderId: string) {
    return this.transitionOrderStatus(orderId, 'delivered', { riderId });
  }

  static async markAsPurchased(orderId: string, reason?: string) {
    return this.transitionOrderStatus(orderId, 'purchased', { reason });
  }

  static async cancelOrder(orderId: string, reason: string) {
    return this.transitionOrderStatus(orderId, 'order_canceled', { reason });
  }

  static getValidTransitions(currentStatus: OrderStatus): OrderStatus[] {
    return this.VALID_TRANSITIONS[currentStatus] || [];
  }

  private static async handleAwaitingReturnPickup(orderId: string) {
    const assignment = await RiderAssignmentService.getAssignmentByOrderId(orderId);
    const orderItems = await OrderItemService.getOrderItemsByOrderId(orderId);
    const returnedItems = orderItems.filter((item) => item.returnStatus === 'returned');

    if (assignment && assignment.riderId) {
      WebSocketService.getIO()
        .to(`rider:${assignment.riderId.toString()}`)
        .emit('return:pickup_required', {
          type: 'return_pickup_required',
          data: {
            orderId,
            returnedItems: returnedItems.length,
            message: 'Customer has items to return - please collect them',
            timestamp: new Date(),
          },
        });

      WebSocketService.getIO()
        .to(`order:${orderId}`)
        .emit('return:rider_coming', {
          type: 'return_rider_coming',
          data: {
            orderId,
            message: 'Rider is waiting to collect your returned items',
            timestamp: new Date(),
          },
        });
    }

    console.log(`Return pickup requested for order ${orderId}`);
  }

  private static async handleReturningToStore(orderId: string) {
    const assignment = await RiderAssignmentService.getAssignmentByOrderId(orderId);
    const order = await OrderService.getOrderByIdInternal(orderId);

    if (assignment && order) {
      WebSocketService.getIO()
        .to(`store:${order.storeId._id.toString()}`)
        .emit('return:rider_returning', {
          type: 'return_rider_returning',
          data: {
            orderId,
            riderId: assignment.riderId.toString(),
            message: 'Rider is returning with customer returns',
            timestamp: new Date(),
          },
        });

      // Notify admin dashboard
      WebSocketService.getIO()
        .to('admin:dashboard')
        .emit('return:rider_returning', {
          type: 'return_rider_returning',
          data: {
            orderId,
            riderId: assignment.riderId.toString(),
            timestamp: new Date(),
          },
        });
    }

    console.log(`Rider returning to store for order ${orderId}`);
  }

  private static async handleStoreCheckingReturns(orderId: string) {
    const order = await OrderService.getOrderByIdInternal(orderId);
    const orderItems = await OrderItemService.getCompleteOrderData(orderId);
    const returnedItems = orderItems.filter((item: any) => item.returnStatus === 'returned');

    // Transform the data to match frontend expectations
    const transformedReturnedItems = returnedItems.map((item: any) => ({
      _id: item._id,
      variantId: {
        _id: item.variantId._id,
        size: item.variantId.size,
        color: item.variantId.color,
        images: item.variantId.images || [],
      },
      product: {
        _id: item.variantId.productId._id,
        title: item.variantId.productId.title,
        category: item.variantId.productId.category,
      },
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      returnStatus: item.returnStatus,
    }));

    if (order) {
      WebSocketService.getIO()
        .to(`store:${order.storeId._id.toString()}`)
        .emit('return:inspect_items', {
          type: 'return_inspect_items',
          data: {
            orderId,
            returnedItems: transformedReturnedItems,
            message: 'Please inspect returned items for damage',
            timestamp: new Date(),
          },
        });

      // Notify admin dashboard
      WebSocketService.getIO()
        .to('admin:dashboard')
        .emit('return:inspection_started', {
          type: 'return_inspection_started',
          data: {
            orderId,
            returnedItemsCount: returnedItems.length,
            timestamp: new Date(),
          },
        });
    }

    console.log(`Store inspection started for order ${orderId}`);
  }

  static async markReturnPickupComplete(orderId: string, riderId: string) {
    return this.transitionOrderStatus(orderId, 'returning_to_store', { riderId });
  }

  static async markReturnsDeliveredToStore(orderId: string) {
    return this.transitionOrderStatus(orderId, 'store_checking_returns');
  }

  private static async restoreStockForReturnedItems(orderId: string): Promise<void> {
    try {
      const orderItems = await OrderItemService.getOrderItemsByOrderId(orderId);
      
      // Only restore stock for items that were returned in good condition
      const goodReturnedItems = orderItems.filter((item) => item.returnStatus === 'returned');
      const damagedReturnedItems = orderItems.filter((item) => item.returnStatus === 'returned_damaged');

      console.log(`Stock restoration analysis for order ${orderId}:`);
      console.log(`- Good returned items (will restore): ${goodReturnedItems.length}`);
      console.log(`- Damaged returned items (will NOT restore): ${damagedReturnedItems.length}`);

      if (goodReturnedItems.length === 0) {
        console.log(`No good returned items to restore stock for order ${orderId}`);
        return;
      }

      const stockRestorations = goodReturnedItems.map(async (item) => {
        try {
          const variantId = item.variantId._id || item.variantId;
          await VariantService.increaseStock(variantId.toString(), item.quantity);
          console.log(
            `✅ Restored ${item.quantity} units of variant ${variantId} to stock (good return from order ${orderId})`,
          );
        } catch (error: any) {
          console.error(`❌ Failed to restore stock for variant ${item.variantId._id || item.variantId}:`, error.message);
        }
      });

      // Log damaged items that are NOT being restored
      damagedReturnedItems.forEach((item) => {
        const variantId = item.variantId._id || item.variantId;
        console.log(
          `🚫 Skipping stock restoration for variant ${variantId} - item was damaged (order ${orderId})`,
        );
      });

      await Promise.all(stockRestorations);
      console.log(`Stock restored for ${goodReturnedItems.length} good returned items from order ${orderId}`);
      if (damagedReturnedItems.length > 0) {
        console.log(`Stock NOT restored for ${damagedReturnedItems.length} damaged returned items from order ${orderId}`);
      }
    } catch (error: any) {
      console.error(`Error restoring stock for returned items in order ${orderId}:`, error.message);
    }
  }

  private static async restoreStockForCancelledOrder(orderId: string): Promise<void> {
    try {
      const orderItems = await OrderItemService.getOrderItemsByOrderId(orderId);

      if (orderItems.length === 0) {
        console.log(`No items to restore stock for cancelled order ${orderId}`);
        return;
      }

      const stockRestorations = orderItems.map(async (item) => {
        try {
          const variantId = item.variantId._id || item.variantId;
          await VariantService.increaseStock(variantId.toString(), item.quantity);
          console.log(`Restored ${item.quantity} units of variant ${variantId} to stock (cancelled order ${orderId})`);
        } catch (error: any) {
          console.error(`Failed to restore stock for variant ${item.variantId._id || item.variantId}:`, error.message);
        }
      });

      await Promise.all(stockRestorations);
      console.log(`Stock restored for all ${orderItems.length} items from cancelled order ${orderId}`);
    } catch (error: any) {
      console.error(`Error restoring stock for cancelled order ${orderId}:`, error.message);
    }
  }
}
