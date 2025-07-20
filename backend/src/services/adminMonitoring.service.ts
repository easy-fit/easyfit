import { OrderModel } from '../models/order.model';
import { RiderLocationModel } from '../models/riderLocation.model';
import { RiderAssignmentModel } from '../models/riderAssignment.model';
import { PaymentModel } from '../models/payment.model';

export interface SystemMetrics {
  timestamp: Date;
  orders: {
    total: number;
    active: number;
    pendingRider: number;
  };
  deliveries: {
    active: number;
  };
  riders: {
    available: number;
  };
  payments: {
    pending: number;
  };
  system: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    nodeVersion: string;
  };
}

export interface AdminIssues {
  pendingRiderAssignments: any[];
  stuckDeliveries: any[];
  paymentSettlementIssues: any[];
  totalIssues: number;
}

export class AdminMonitoringService {
  static async getSystemMetrics(): Promise<SystemMetrics> {
    const [totalOrders, activeOrders, pendingRiderOrders, activeDeliveries, availableRiders, pendingPayments] =
      await Promise.all([
        OrderModel.countDocuments(),
        OrderModel.countDocuments({ isActive: true }),
        OrderModel.countDocuments({ status: 'pending_rider' }),
        RiderAssignmentModel.countDocuments({
          status: { $in: ['assigned', 'picked_up', 'in_transit'] },
        }),
        RiderLocationModel.countDocuments({ isAvailable: true }),
        PaymentModel.countDocuments({
          status: { $nin: ['captured', 'refunded', 'cancelled'] },
        }),
      ]);

    return {
      timestamp: new Date(),
      orders: {
        total: totalOrders,
        active: activeOrders,
        pendingRider: pendingRiderOrders,
      },
      deliveries: {
        active: activeDeliveries,
      },
      riders: {
        available: availableRiders,
      },
      payments: {
        pending: pendingPayments,
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
      },
    };
  }

  /**
   * Get orders and issues that need admin attention
   */
  static async getOrdersNeedingAttention(): Promise<AdminIssues> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const [pendingRiderOrders, stuckDeliveries, paymentIssues] = await Promise.all([
      // Orders pending rider for too long (15+ minutes)
      OrderModel.find({
        status: 'pending_rider',
        updatedAt: { $lt: fifteenMinutesAgo },
      })
        .populate('userId', 'name email')
        .populate('storeId', 'name')
        .sort({ updatedAt: 1 }),

      // Orders stuck in delivery (1+ hour)
      OrderModel.find({
        status: { $in: ['rider_assigned', 'in_transit'] },
        updatedAt: { $lt: oneHourAgo },
      })
        .populate('userId', 'name email')
        .populate('storeId', 'name')
        .sort({ updatedAt: 1 }),

      // Payment settlement issues (30+ minutes)
      PaymentModel.find({
        status: { $nin: ['captured', 'refunded', 'cancelled'] },
        updatedAt: { $lt: thirtyMinutesAgo },
      })
        .populate('orderId')
        .sort({ updatedAt: 1 }),
    ]);

    return {
      pendingRiderAssignments: pendingRiderOrders,
      stuckDeliveries,
      paymentSettlementIssues: paymentIssues,
      totalIssues: pendingRiderOrders.length + stuckDeliveries.length + paymentIssues.length,
    };
  }

  /**
   * Get active deliveries for real-time monitoring
   */
  static async getActiveDeliveries(): Promise<{ activeDeliveries: any[]; count: number }> {
    const activeDeliveries = await RiderAssignmentModel.find({
      status: { $in: ['assigned', 'picked_up', 'in_transit'] },
    })
      .populate({
        path: 'orderId',
        populate: [
          { path: 'userId', select: 'name email' },
          { path: 'storeId', select: 'name address' },
        ],
      })
      .populate('riderId', 'name email')
      .sort({ assignedAt: -1 });

    return {
      activeDeliveries,
      count: activeDeliveries.length,
    };
  }

  /**
   * Get system health overview
   */
  static async getSystemHealth(): Promise<any> {
    const metrics = await this.getSystemMetrics();
    const issues = await this.getOrdersNeedingAttention();

    // Determine system status based on metrics
    let systemStatus = 'operational';
    if (issues.totalIssues > 10) {
      systemStatus = 'degraded';
    }
    if (issues.totalIssues > 25) {
      systemStatus = 'critical';
    }

    return {
      timestamp: new Date(),
      status: systemStatus,
      services: {
        websocket: 'operational', // This could be enhanced to actually check WebSocket health
        database: 'operational', // This could ping the database
        payment_gateway: 'operational', // This could check MercadoPago API
        rider_assignment: issues.pendingRiderAssignments.length > 5 ? 'degraded' : 'operational',
      },
      metrics,
      issuesSummary: {
        total: issues.totalIssues,
        pendingRiders: issues.pendingRiderAssignments.length,
        stuckDeliveries: issues.stuckDeliveries.length,
        paymentIssues: issues.paymentSettlementIssues.length,
      },
    };
  }

  /**
   * Retry failed operations (admin manual intervention)
   */
  static async retryFailedOperation(orderId: string, operation: string): Promise<any> {
    switch (operation) {
      case 'rider_assignment':
        // Import here to avoid circular dependency
        const { RiderAssignmentOrchestrator } = await import('./riderAssignmentOrchestrator.service');
        await RiderAssignmentOrchestrator.assignRiderToOrder(orderId);
        return { message: 'Rider assignment retry initiated', orderId };

      case 'payment_settlement':
        // This would retry payment settlement
        // For now, just log the attempt
        console.log(`Admin initiated payment settlement retry for order ${orderId}`);
        return { message: 'Payment settlement retry logged for manual review', orderId };

      default:
        throw new Error('Invalid operation type');
    }
  }
}
