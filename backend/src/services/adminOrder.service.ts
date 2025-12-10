import { OrderService } from './order.service';
import { OrderStateManager } from './orderStateManager.service';
import { RiderAssignmentOrchestrator } from './riderAssignmentOrchestrator.service';
import { RiderLocationService } from './riderLocation.service';
import { UserService } from './user.service';
import { AppError } from '../utils/appError';
import { OrderStatus } from '../types/order.types';
import { UserModel } from '../models/user.model';
import { User } from '../types/user.types';
import { RiderLocation, GeoPoint } from '../types/riderLocation.types';

export class AdminOrderService {
  /**
   * Get all available riders for manual assignment
   * Returns all riders (available and unavailable) with their details
   */
  static async getAvailableRidersForOrder(orderId: string) {
    // Verify order exists
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Get all riders from the system
    const allRiders = await UserModel.find({ role: 'rider' }).select('name surname email').lean();

    // Get rider location/availability data
    const riderLocations = await RiderLocationService.getAllRiderLocations();

    // Build a map of rider availability
    const availabilityMap = new Map<string, { isAvailable: boolean; location: GeoPoint }>(
      riderLocations.map((loc: any) => [
        loc.riderId.toString(),
        { isAvailable: loc.isAvailable || false, location: loc.location },
      ]),
    );

    // Combine rider info with availability
    const ridersWithAvailability = allRiders.map((rider: any) => {
      const availability = availabilityMap.get(rider._id.toString());

      return {
        _id: rider._id,
        name: rider.name,
        surname: rider.surname,
        email: rider.email,
        isAvailable: availability?.isAvailable || false,
        location: availability?.location || null,
      };
    });

    // Sort: available riders first
    ridersWithAvailability.sort((a: any, b: any) => {
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      return 0;
    });

    return ridersWithAvailability;
  }

  /**
   * Manually assign a rider to an order (admin override)
   * Bypasses the WebSocket offer system and directly assigns
   * Optionally accepts a rider code to immediately verify delivery and trigger try-on period
   */
  static async manuallyAssignRider(orderId: string, riderId: string, riderCode?: string) {
    // Verify order exists
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Verify rider exists
    const rider = await UserService.getUserById(riderId);
    if (!rider || rider.role !== 'rider') {
      throw new AppError('Rider not found or invalid user role', 404);
    }

    // Check if order can accept rider assignment
    if (order.status !== 'order_accepted' && order.status !== 'pending_rider' && order.status !== 'rider_assigned') {
      throw new AppError(`Cannot assign rider to order with status: ${order.status}`, 400);
    }

    // Use the existing rider acceptance handler which handles all the logic
    await RiderAssignmentOrchestrator.handleRiderAcceptance(orderId, riderId);

    console.log(`Admin manually assigned rider ${riderId} to order ${orderId}`);

    // If rider code is provided, verify delivery and trigger try-on period
    if (riderCode) {
      // Validate code format (6 digits)
      if (!/^\d{6}$/.test(riderCode)) {
        throw new AppError('Rider code must be a 6-digit number', 400);
      }

      // Start delivery (transition to in_transit)
      await OrderStateManager.markAsPickedUp(orderId, riderId);

      // Verify delivery code (this will trigger try-on period if enabled)
      const verificationResult = await OrderService.verifyDeliveryCode(orderId, riderCode, riderId);

      if (!verificationResult.success) {
        throw new AppError(verificationResult.message || 'Failed to verify delivery code', 400);
      }

      return {
        success: true,
        message: `Rider ${rider.name} ${rider.surname} assigned and delivery verified. Try-on period started.`,
        order: await OrderService.getOrderById(orderId),
        deliveryVerified: true,
      };
    }

    return {
      success: true,
      message: `Rider ${rider.name} ${rider.surname} assigned to order successfully`,
      order: await OrderService.getOrderById(orderId),
      deliveryVerified: false,
    };
  }

  /**
   * Force a status transition (admin override)
   * Bypasses normal state machine validation
   */
  static async forceStatusTransition(orderId: string, newStatus: OrderStatus, reason?: string) {
    // Verify order exists
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const previousStatus = order.status;

    // Use skipValidation flag to bypass state machine checks
    const updatedOrder = await OrderStateManager.transitionOrderStatus(orderId, newStatus, {
      skipValidation: true,
      reason: reason || 'Manual admin override',
    });

    console.log(`Admin forced status transition for order ${orderId}: ${previousStatus} -> ${newStatus}`);

    return {
      success: true,
      message: `Order status changed from ${previousStatus} to ${newStatus}`,
      previousStatus,
      newStatus,
      order: updatedOrder,
    };
  }

  /**
   * Get detailed order information for manual management
   */
  static async getOrderDetailsForManagement(orderId: string) {
    const order = await OrderService.getOrderByIdInternal(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Get valid transitions according to state machine
    const validTransitions = OrderStateManager.getValidTransitions(order.status);

    // Get all possible statuses for admin override
    const allStatuses: OrderStatus[] = [
      'order_placed',
      'order_accepted',
      'order_canceled',
      'pending_rider',
      'rider_assigned',
      'in_transit',
      'delivered',
      'awaiting_return_pickup',
      'returning_to_store',
      'store_checking_returns',
      'purchased',
      'return_completed',
      'stolen',
    ];

    return {
      order,
      currentStatus: order.status,
      validTransitions,
      allStatuses,
    };
  }
}
