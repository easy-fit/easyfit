import { OrderService } from './order.service';
import { OrderStateManager } from './orderStateManager.service';
import { RiderAssignmentOrchestrator } from './riderAssignmentOrchestrator.service';
import { RiderLocationService } from './riderLocation.service';
import { UserService } from './user.service';
import { AppError } from '../utils/appError';
import { OrderStatus } from '../types/order.types';

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
    const allRiders = await UserService.getUsersByRole('rider');

    // Get rider location/availability data
    const riderLocations = await RiderLocationService.getAllRiderLocations();

    // Build a map of rider availability
    const availabilityMap = new Map(
      riderLocations.map((loc) => [loc.riderId.toString(), { isAvailable: loc.isAvailable, location: loc.location }]),
    );

    // Combine rider info with availability
    const ridersWithAvailability = allRiders.map((rider) => {
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
    ridersWithAvailability.sort((a, b) => {
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      return 0;
    });

    return ridersWithAvailability;
  }

  /**
   * Manually assign a rider to an order (admin override)
   * Bypasses the WebSocket offer system and directly assigns
   */
  static async manuallyAssignRider(orderId: string, riderId: string) {
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

    return {
      success: true,
      message: `Rider ${rider.name} ${rider.surname} assigned to order successfully`,
      order: await OrderService.getOrderById(orderId),
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
