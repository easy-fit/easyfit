import { Types } from 'mongoose';
import { OrderModel } from '../../models/order.model';
import { OrderItemModel } from '../../models/orderItem.model';
import { AppError } from '../../utils/appError';

export interface DateRangeFilter {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
}

export interface AnalyticsFilters {
  dateRange: string; // 'today', '7days', '30days'
  orderType?: string; // 'all', 'completed', 'returned', 'purchased'
}

export class StoreAnalyticsService {
  /**
   * Get detailed analytics for a store including KPIs, charts, and performance metrics
   */
  static async getDetailedAnalytics(storeId: string, filters: AnalyticsFilters) {
    const storeObjectId = new Types.ObjectId(storeId);
    const dateFilter = this.calculateDateRange(filters.dateRange);

    try {
      const [kpis, chartData, categoryData, topProducts, performanceMetrics] = await Promise.all([
        this.getKPIs(storeObjectId, dateFilter, filters.orderType),
        this.getChartData(storeObjectId, dateFilter, filters.orderType),
        this.getCategoryDistribution(storeObjectId, dateFilter, filters.orderType),
        this.getTopProducts(storeObjectId, dateFilter, filters.orderType),
        this.getPerformanceMetrics(storeObjectId, dateFilter, filters.orderType),
      ]);

      return {
        kpis,
        chartData,
        categoryData,
        topProducts,
        performanceMetrics,
        dateRange: {
          current: { start: dateFilter.start, end: dateFilter.end },
          previous: { start: dateFilter.previousStart, end: dateFilter.previousEnd },
        },
      };
    } catch (error) {
      console.error('Error in getDetailedAnalytics:', error);
      throw new AppError('Error retrieving detailed analytics', 500);
    }
  }

  /**
   * Calculate KPIs with period-over-period comparison
   */
  private static async getKPIs(
    storeId: Types.ObjectId,
    dateFilter: DateRangeFilter,
    orderType?: string,
  ) {
    const matchQuery = this.buildOrderMatchQuery(storeId, orderType);

    const [currentPeriod, previousPeriod] = await Promise.all([
      // Current period
      OrderModel.aggregate([
        {
          $match: {
            ...matchQuery,
            createdAt: { $gte: dateFilter.start, $lte: dateFilter.end },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            averageTicket: { $avg: '$total' },
            uniqueCustomers: { $addToSet: '$userId' },
          },
        },
        {
          $addFields: {
            uniqueCustomersCount: { $size: '$uniqueCustomers' },
          },
        },
      ]),

      // Previous period
      OrderModel.aggregate([
        {
          $match: {
            ...matchQuery,
            createdAt: { $gte: dateFilter.previousStart, $lte: dateFilter.previousEnd },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            averageTicket: { $avg: '$total' },
            uniqueCustomers: { $addToSet: '$userId' },
          },
        },
        {
          $addFields: {
            uniqueCustomersCount: { $size: '$uniqueCustomers' },
          },
        },
      ]),
    ]);

    // Calculate purchase rate for current period
    const purchaseRateData = await OrderModel.aggregate([
      {
        $match: {
          storeId,
          status: { $in: ['purchased', 'returned_ok', 'returned_partial', 'returned_damaged'] },
          createdAt: { $gte: dateFilter.start, $lte: dateFilter.end },
        },
      },
      {
        $group: {
          _id: null,
          totalCompleted: { $sum: 1 },
          purchased: {
            $sum: { $cond: [{ $eq: ['$status', 'purchased'] }, 1, 0] },
          },
        },
      },
    ]);

    const current = currentPeriod[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageTicket: 0,
      uniqueCustomersCount: 0,
    };
    const previous = previousPeriod[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageTicket: 0,
      uniqueCustomersCount: 0,
    };
    const purchaseRate = purchaseRateData[0] || { totalCompleted: 0, purchased: 0 };

    return {
      totalRevenue: {
        current: current.totalRevenue,
        previous: previous.totalRevenue,
        change: this.calculatePercentageChange(current.totalRevenue, previous.totalRevenue),
      },
      totalOrders: {
        current: current.totalOrders,
        previous: previous.totalOrders,
        change: this.calculatePercentageChange(current.totalOrders, previous.totalOrders),
      },
      averageTicket: {
        current: Math.round(current.averageTicket || 0),
        previous: Math.round(previous.averageTicket || 0),
        change: this.calculatePercentageChange(current.averageTicket || 0, previous.averageTicket || 0),
      },
      purchaseRate: {
        current: purchaseRate.totalCompleted > 0 ? (purchaseRate.purchased / purchaseRate.totalCompleted) * 100 : 0,
        previous: 0, // Would need similar calculation for previous period
        change: 0,
      },
      uniqueCustomers: current.uniqueCustomersCount,
    };
  }

  /**
   * Get chart data for daily revenue/orders over the selected period
   */
  private static async getChartData(
    storeId: Types.ObjectId,
    dateFilter: DateRangeFilter,
    orderType?: string,
  ) {
    const matchQuery = this.buildOrderMatchQuery(storeId, orderType);

    // Generate array of all dates in the period
    const dates = this.generateDateArray(dateFilter.start, dateFilter.end);

    const [currentData, previousData] = await Promise.all([
      // Current period
      OrderModel.aggregate([
        {
          $match: {
            ...matchQuery,
            createdAt: { $gte: dateFilter.start, $lte: dateFilter.end },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
      ]),

      // Previous period
      OrderModel.aggregate([
        {
          $match: {
            ...matchQuery,
            createdAt: { $gte: dateFilter.previousStart, $lte: dateFilter.previousEnd },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Create lookup maps
    const currentMap = new Map(currentData.map((item) => [item._id.date, item]));
    const previousMap = new Map(previousData.map((item) => [item._id.date, item]));

    // Generate chart data with all dates
    return dates.map((date, index) => {
      const currentItem = currentMap.get(date) || { revenue: 0, orders: 0 };
      const previousDates = this.generateDateArray(dateFilter.previousStart, dateFilter.previousEnd);
      const previousDate = previousDates[index] || date;
      const previousItem = previousMap.get(previousDate) || { revenue: 0, orders: 0 };

      return {
        date: this.formatDateForChart(date, dateFilter.start, dateFilter.end),
        currentRevenue: currentItem.revenue,
        previousRevenue: previousItem.revenue,
        currentOrders: currentItem.orders,
        previousOrders: previousItem.orders,
      };
    });
  }

  /**
   * Get category distribution data
   */
  private static async getCategoryDistribution(
    storeId: Types.ObjectId,
    dateFilter: DateRangeFilter,
    orderType?: string,
  ) {
    const matchQuery = this.buildOrderMatchQuery(storeId, orderType);

    const categoryData = await OrderModel.aggregate([
      {
        $match: {
          ...matchQuery,
          createdAt: { $gte: dateFilter.start, $lte: dateFilter.end },
        },
      },
      {
        $lookup: {
          from: 'orderitems',
          localField: '_id',
          foreignField: 'orderId',
          as: 'items',
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'variants',
          localField: 'items.variantId',
          foreignField: '_id',
          as: 'variant',
        },
      },
      { $unwind: '$variant' },
      {
        $lookup: {
          from: 'products',
          localField: 'variant.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] } },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$revenue' },
          categories: {
            $push: {
              category: '$_id',
              revenue: '$revenue',
            },
          },
        },
      },
    ]);

    if (!categoryData[0]) {
      return [];
    }

    const { total, categories } = categoryData[0];

    return categories.map((cat: any) => ({
      category: cat.category, // Return raw category key (clothing, footwear, etc.)
      value: Math.round((cat.revenue / total) * 100 * 10) / 10, // Round to 1 decimal
    }));
  }

  /**
   * Get top performing products
   */
  private static async getTopProducts(
    storeId: Types.ObjectId,
    dateFilter: DateRangeFilter,
    orderType?: string,
  ) {
    const matchQuery = this.buildOrderMatchQuery(storeId, orderType);

    const topProducts = await OrderModel.aggregate([
      {
        $match: {
          ...matchQuery,
          createdAt: { $gte: dateFilter.start, $lte: dateFilter.end },
        },
      },
      {
        $lookup: {
          from: 'orderitems',
          localField: '_id',
          foreignField: 'orderId',
          as: 'items',
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'variants',
          localField: 'items.variantId',
          foreignField: '_id',
          as: 'variant',
        },
      },
      { $unwind: '$variant' },
      {
        $lookup: {
          from: 'products',
          localField: 'variant.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product._id',
          name: { $first: '$product.title' },
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] } },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ]);

    return topProducts.map((product) => ({
      name: product.name,
      sales: product.sales,
      revenue: Math.round(product.revenue),
    }));
  }

  /**
   * Get performance metrics
   */
  private static async getPerformanceMetrics(
    storeId: Types.ObjectId,
    dateFilter: DateRangeFilter,
    orderType?: string,
  ) {
    // Conversion and return rates
    const conversionData = await OrderModel.aggregate([
      {
        $match: {
          storeId,
          status: { $in: ['purchased', 'returned_ok', 'returned_partial', 'returned_damaged'] },
          createdAt: { $gte: dateFilter.start, $lte: dateFilter.end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          purchased: { $sum: { $cond: [{ $eq: ['$status', 'purchased'] }, 1, 0] } },
          returned: {
            $sum: {
              $cond: [
                { $in: ['$status', ['returned_ok', 'returned_partial', 'returned_damaged']] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const conversion = conversionData[0] || { total: 0, purchased: 0, returned: 0 };

    return {
      conversionRate: conversion.total > 0 ? (conversion.purchased / conversion.total) * 100 : 0,
      returnRate: conversion.total > 0 ? (conversion.returned / conversion.total) * 100 : 0,
      avgRating: 4.7, // Placeholder - would need review/rating system
    };
  }

  /**
   * Build order match query based on order type filter
   */
  private static buildOrderMatchQuery(storeId: Types.ObjectId, orderType?: string) {
    const baseQuery = { storeId };

    switch (orderType) {
      case 'completed':
        return { ...baseQuery, status: { $in: ['purchased', 'returned_ok', 'returned_partial'] } };
      case 'returned':
        return { ...baseQuery, status: { $in: ['returned_ok', 'returned_partial', 'returned_damaged'] } };
      case 'purchased':
        return { ...baseQuery, status: 'purchased' };
      default:
        return baseQuery;
    }
  }

  /**
   * Calculate date ranges for current and previous periods
   * Uses proper period-over-period comparison (same period from previous cycle)
   */
  private static calculateDateRange(dateRange: string): DateRangeFilter {
    const now = new Date();
    let start: Date, end: Date, offsetDays: number;

    switch (dateRange) {
      case 'today':
        // Today vs same day last week (7 days ago)
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(start);
        end.setDate(end.getDate() + 1);
        offsetDays = 7;
        break;
      case '7days':
        // Last 7 days vs same 7 days from previous week
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        offsetDays = 7;
        break;
      case '30days':
        // Last 30 days vs same 30 days from previous month
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        offsetDays = 30;
        break;
      default:
        // Default to last 7 days
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        offsetDays = 7;
    }

    // Calculate previous period (same timeframe from previous cycle)
    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - offsetDays);
    const previousEnd = new Date(end);
    previousEnd.setDate(previousEnd.getDate() - offsetDays);

    return { start, end, previousStart, previousEnd };
  }

  /**
   * Generate array of date strings for a period
   */
  private static generateDateArray(start: Date, end: Date): string[] {
    const dates: string[] = [];
    const current = new Date(start);

    while (current < end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Format date for chart display based on the time period
   */
  private static formatDateForChart(dateString: string, periodStart: Date, periodEnd: Date): string {
    const date = new Date(dateString);
    const periodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (periodDays === 1) {
      // Today: Show hours (00:00, 06:00, 12:00, 18:00)
      return date.getHours().toString().padStart(2, '0') + ':00';
    } else if (periodDays <= 7) {
      // 7 days: Show day names
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return days[date.getDay()];
    } else {
      // 30 days: Show actual dates (MM/DD format)
      const month = (date.getMonth() + 1).toString();
      const day = date.getDate().toString();
      return `${month}/${day}`;
    }
  }

  /**
   * Calculate percentage change between two values
   */
  private static calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  }
}