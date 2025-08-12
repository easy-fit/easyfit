import { OrderService } from './order.service';
import { OrderModel } from '../models/order.model';
import { RiderAssignmentModel } from '../models/riderAssignment.model';
import { RiderLocationService } from './riderLocation.service';
import { OrderStoreService } from './orderStore.service';
import { WebSocketService } from './websocket.service';
import { ErrorHandlingService } from './errorHandling.service';
import { AppError } from '../utils/appError';
import { RiderOfferPayload } from '../types/websocket.types';

export class RiderAssignmentOrchestrator {
  static async assignRiderToOrder(orderId: string): Promise<string | null> {
    try {
      return await ErrorHandlingService.executeWithRetry(
        {
          operation: async () => {
            return this.executeRiderAssignment(orderId);
          },
          maxRetries: 3,
          delay: 10000, // 10 seconds between retries
          backoff: true,
          context: {
            orderId,
            operation: 'rider_assignment',
            stage: 'sequential_offering',
            originalError: new Error('Rider assignment operation'),
          },
        },
        [
          {
            description: 'Expand search radius and retry',
            execute: async () => {
              await this.retryWithExpandedRadius(orderId, 20);
              return 'fallback_executed';
            },
          },
          {
            description: 'Notify admin for manual assignment',
            execute: async () => {
              await this.notifyAdminOfAssignmentIssue(orderId);
              return 'admin_notified';
            },
          },
        ],
      );
    } catch (error: any) {
      ErrorHandlingService.handleRiderAssignmentError(orderId, error);
      await this.handleNoRidersAvailable(orderId);
      return null;
    }
  }

  static async executeRiderAssignment(orderId: string): Promise<string | null> {
    const order = await OrderService.getOrderById(orderId);

    if (order?.status !== 'order_accepted') {
      throw new AppError('Order must be accepted by store before rider assignment', 400);
    }

    const store = order.storeId as any;
    const storeCoordinates: [number, number] = [
      store.address.location.coordinates[0],
      store.address.location.coordinates[1],
    ];

    const availableRiders = await RiderLocationService.getAvailableNearbyRiders(storeCoordinates);

    // Get optimized order data for rider offer
    const orderData = await this.createRiderOfferPayload(orderId, store);

    const riderIds = availableRiders.map((rider) => rider.riderId.toString());

    const assignedRiderId = await WebSocketService.offerToRidersSequentially(riderIds, {
      ...orderData,
      riderId: '',
    });

    if (assignedRiderId) {
      console.log(`Rider ${assignedRiderId} assigned to order ${orderId}`);
      return assignedRiderId;
    } else {
      throw new AppError('No riders accepted the assignment', 404);
    }
  }

  static async createRiderOfferPayload(orderId: string, store: any): Promise<Omit<RiderOfferPayload, 'riderId'>> {
    const order = (await OrderModel.findById(orderId).lean()) as any;
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return {
      order: {
        _id: order._id.toString(),
        shipping: {
          type: order.shipping.type,
          address: {
            formatted: {
              street: order.shipping.address.formatted.street,
              streetNumber: order.shipping.address.formatted.streetNumber,
              apartment: order.shipping.address.formatted.apartment || '',
              floor: order.shipping.address.formatted.floor || '',
              building: order.shipping.address.formatted.building || '',
            },
          },
          cost: order.shipping.cost,
          distance: order.shipping.distanceKm,
          tryOnEnabled: order.shipping.tryOnEnabled,
        },
      },
      storeInfo: {
        name: store.name,
        address: {
          formatted: {
            street: store.address.formatted.street,
            streetNumber: store.address.formatted.streetNumber,
          },
        },
      },
      timeout: 30000,
      timestamp: new Date(),
    };
  }

  static async handleNoRidersAvailable(orderId: string) {
    await OrderService.updateOrder(orderId, {
      status: 'pending_rider',
    });

    console.log(`No riders available for order ${orderId}. Implementing fallback strategy.`);

    await this.implementFallbackStrategies(orderId);
  }

  static async implementFallbackStrategies(orderId: string) {
    await this.retryWithExpandedRadius(orderId, 20);

    setTimeout(async () => {
      const order = await OrderService.getOrderById(orderId);
      if (order && order.status === 'pending_rider') {
        console.log(`Retrying rider assignment for order ${orderId} after 5 minutes`);
        await this.assignRiderToOrder(orderId);
      }
    }, 5 * 60 * 1000);

    setTimeout(async () => {
      const order = await OrderService.getOrderById(orderId);
      if (order && order.status === 'pending_rider') {
        await this.notifyAdminOfAssignmentIssue(orderId);
      }
    }, 10 * 60 * 1000);
  }

  static async retryWithExpandedRadius(orderId: string, radiusKm: number) {
    try {
      const order = await OrderService.getOrderById(orderId);
      const store = order?.storeId as any;
      const storeCoordinates: [number, number] = [
        store.address.location.coordinates[1],
        store.address.location.coordinates[0],
      ];

      const expandedRiders = await RiderLocationService.getAvailableNearbyRiders(storeCoordinates, radiusKm);

      if (expandedRiders.length > 0) {
        console.log(`Found ${expandedRiders.length} riders with expanded radius of ${radiusKm}km for order ${orderId}`);

        await this.assignRiderToOrder(orderId);
      }
    } catch (error) {
      console.error(`Error in expanded radius retry for order ${orderId}:`, error);
    }
  }

  static async notifyAdminOfAssignmentIssue(orderId: string) {
    const orderData = await OrderStoreService.getCompleteOrderData(orderId);

    WebSocketService.getIO()
      .to('admin:dashboard')
      .emit('order:assignment_issue', {
        type: 'assignment_issue',
        priority: 'high',
        data: {
          orderId,
          order: orderData.order,
          customer: orderData.customer,
          duration: '10+ minutes',
          message: 'Order has been waiting for rider assignment for over 10 minutes',
          timestamp: new Date(),
        },
      });

    console.log(`URGENT: Order ${orderId} has been pending rider assignment for over 10 minutes`);
  }

  static async handleRiderAcceptance(orderId: string, riderId: string) {
    await RiderAssignmentModel.findOneAndUpdate({ orderId, riderId }, { status: 'assigned' }, { upsert: true });

    await OrderService.updateOrder(orderId, {
      status: 'rider_assigned',
    });

    await RiderLocationService.setRiderAvailability(riderId, false);

    const orderData = await OrderStoreService.getCompleteOrderData(orderId);
    console.log(orderData.order.shipping);
    const order = await OrderService.getOrderById(orderId);
    const store = order?.storeId as any;
    const storeCoordinates: [number, number] = [
      store.address.location.coordinates[1],
      store.address.location.coordinates[0],
    ];

    // 1. Notify customer about rider assignment
    WebSocketService.emitOrderStatusUpdate({
      order: orderData.order,
      previousStatus: 'order_accepted',
      newStatus: 'rider_assigned',
      timestamp: new Date(),
      details: {
        message: 'Rider assigned and heading to store',
        riderId,
      },
    });
    // 2. Send confirmation to the accepting rider
    WebSocketService.getIO()
      .to(`rider:${riderId}`)
      .emit('order:assignment_confirmed', {
        type: 'assignment_confirmed',
        data: {
          order: {
            orderId,
            status: orderData?.order.status,
          },
          customer: {
            name: orderData.customer.name,
            surname: orderData.customer.surname,
          },
          storeInfo: {
            name: store.name,
            address: {
              formatted: {
                street: store.address.formatted.street,
                streetNumber: store.address.formatted.streetNumber,
              },
              coordinates: {
                latitude: storeCoordinates[1],
                longitude: storeCoordinates[0],
              },
            },
          },
          shipping: {
            address: {
              formatted: {
                street: orderData?.order.shipping.address.formatted.street,
                streetNumber: orderData?.order.shipping.address.formatted.streetNumber,
                apartment: orderData?.order.shipping.address.formatted.apartment || '',
                floor: orderData?.order.shipping.address.formatted.floor || '',
                building: orderData?.order.shipping.address.formatted.building || '',
              },
              coordinates: {
                latitude: orderData.order.shipping.address.coordinates[1],
                longitude: orderData?.order.shipping.address.coordinates[0],
              },
            },
            cost: order?.shipping.cost,
            type: order?.shipping.type,
          },
          timestamp: new Date(),
        },
      });

    // 3. Notify store that rider was assigned
    const storeId = (order?.storeId as any)._id?.toString() || order?.storeId.toString();
    WebSocketService.getIO()
      .to(`store:${storeId}`)
      .emit('order:rider_assigned', {
        type: 'rider_assigned',
        data: {
          orderId,
          riderId,
          message: 'Rider has been assigned to your order',
          timestamp: new Date(),
        },
      });

    console.log(`Rider ${riderId} accepted delivery for order ${orderId}`);
  }

  // This specific rider can't do it, find another one
  static async handleRiderCancellation(orderId: string, riderId: string, reason?: string) {
    await RiderAssignmentModel.findOneAndUpdate({ orderId, riderId }, { status: 'cancelled' });

    await RiderLocationService.setRiderAvailability(riderId, true);

    console.log(`Rider ${riderId} cancelled delivery for order ${orderId}. Reason: ${reason}`);
    setTimeout(() => {
      this.assignRiderToOrder(orderId);
    }, 5000);
  }
}
