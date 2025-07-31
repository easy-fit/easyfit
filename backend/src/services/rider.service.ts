import { Types } from 'mongoose';
import { RiderAssignmentModel } from '../models/riderAssignment.model';
import { OrderModel } from '../models/order.model';
import { UserModel } from '../models/user.model';
import { StoreModel } from '../models/store.model';
import { WeeklySummaryDTO, RecentActivityDTO, RecentActivityItemDTO } from '../types/rider.types';

export class RiderService {
  static async getWeeklySummary(riderId: string): Promise<WeeklySummaryDTO> {
    const riderObjectId = new Types.ObjectId(riderId);
    
    // Calculate date range for the past 7 days
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    // Aggregate pipeline to get weekly stats
    const weeklyStats = await RiderAssignmentModel.aggregate([
      {
        $match: {
          riderId: riderObjectId,
          status: 'delivered',
          deliveredAt: { $gte: weekAgo, $lte: today }
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order'
        }
      },
      {
        $unwind: '$order'
      },
      {
        $group: {
          _id: null,
          ordersCompleted: { $sum: 1 },
          weeklyEarnings: { $sum: '$order.shipping.cost' }
        }
      }
    ]);

    // Get rider rating from user info
    const rider = await UserModel.findById(riderId).select('riderInfo.score');
    let rating = 0;
    if (rider?.riderInfo?.score) {
      const { upvotes = 0, downvotes = 0 } = rider.riderInfo.score;
      const totalVotes = upvotes + downvotes;
      if (totalVotes > 0) {
        rating = parseFloat((upvotes / totalVotes * 5).toFixed(1)); // Convert to 5-star scale
      }
    }

    // Calculate estimated active time today (workaround)
    const activeTimeToday = await this.estimateActiveTimeToday(riderId);

    const stats = weeklyStats[0] || { ordersCompleted: 0, weeklyEarnings: 0 };

    return {
      ordersCompleted: stats.ordersCompleted,
      weeklyEarnings: stats.weeklyEarnings,
      rating,
      activeTimeToday
    };
  }

  static async getRecentActivity(riderId: string, limit: number = 10): Promise<RecentActivityDTO> {
    const riderObjectId = new Types.ObjectId(riderId);

    const recentActivities = await RiderAssignmentModel.aggregate([
      {
        $match: {
          riderId: riderObjectId,
          status: 'delivered',
          deliveredAt: { $exists: true }
        }
      },
      {
        $sort: { deliveredAt: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order'
        }
      },
      {
        $unwind: '$order'
      },
      {
        $lookup: {
          from: 'stores',
          localField: 'order.storeId',
          foreignField: '_id',
          as: 'store'
        }
      },
      {
        $unwind: '$store'
      },
      {
        $project: {
          orderId: '$order._id',
          orderNumber: { $toString: '$order._id' }, // Use ObjectId as order number for now
          location: '$store.address.city',
          deliveredAt: '$deliveredAt',
          earnings: '$order.shipping.cost'
        }
      }
    ]);

    const activities: RecentActivityItemDTO[] = recentActivities.map(activity => ({
      orderId: activity.orderId.toString(),
      orderNumber: `#${activity.orderNumber.slice(-4)}`, // Last 4 chars as order number
      location: activity.location || 'Ubicación no disponible',
      deliveredAt: activity.deliveredAt,
      earnings: activity.earnings,
      timeSinceDelivery: this.formatTimeSince(activity.deliveredAt)
    }));

    return { activities };
  }

  private static async estimateActiveTimeToday(riderId: string): Promise<number> {
    const riderObjectId = new Types.ObjectId(riderId);
    
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's deliveries to estimate active time
    const todayDeliveries = await RiderAssignmentModel.find({
      riderId: riderObjectId,
      deliveredAt: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ deliveredAt: 1 }).select('assignedAt pickedUpAt deliveredAt');

    if (todayDeliveries.length === 0) {
      // No deliveries today, return a default minimum active time if rider has any activity
      return 0;
    }

    // Simple estimation: time between first assignment and last delivery + buffer time
    const firstActivity = todayDeliveries[0].assignedAt || todayDeliveries[0].pickedUpAt;
    const lastActivity = todayDeliveries[todayDeliveries.length - 1].deliveredAt;

    if (firstActivity && lastActivity) {
      const activeMilliseconds = lastActivity.getTime() - firstActivity.getTime();
      const activeMinutes = Math.floor(activeMilliseconds / (1000 * 60));
      
      // Add 60 minutes buffer time for preparation and between deliveries
      return Math.max(activeMinutes + 60, 120); // Minimum 2 hours if active
    }

    // Fallback: estimate based on number of deliveries (45 minutes per delivery)
    return todayDeliveries.length * 45;
  }

  private static formatTimeSince(date: Date): string {
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInMinutes > 0) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    } else {
      return 'Hace un momento';
    }
  }
}