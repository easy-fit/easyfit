import { OrderModel } from '../models/order.model';
import { PaymentModel } from '../models/payment.model';
import { StoreModel } from '../models/store.model';
import { UserModel } from '../models/user.model';
import {
  StoreBalanceSummary,
  StoreOrderDetails,
  OrderFinancialDetail,
  PaginatedStoreBalances,
  PaginationOptions,
  FilterOptions,
} from '../types/storeFinance.types';
import AppError from '../utils/appError';
import mongoose from 'mongoose';

export class StoreFinanceService {
  /**
   * Get balances for all stores with pagination
   */
  static async getAllStoreBalances(options: PaginationOptions = {}): Promise<PaginatedStoreBalances> {
    const { page = 1, limit = 1000, sortBy = 'netBalance', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    try {
      // Calculate date 7 days ago at start of day (00:00:00)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Aggregation pipeline to calculate store balances
      const pipeline: any[] = [
        // Stage 1: Match all orders from last 7 days (regardless of status)
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
          },
        },

        // Stage 2: Lookup Payment records
        {
          $lookup: {
            from: 'payments',
            localField: '_id',
            foreignField: 'orderId',
            as: 'payment',
          },
        },

        // Stage 3: Unwind payment (handle missing payments gracefully)
        {
          $unwind: {
            path: '$payment',
            preserveNullAndEmptyArrays: false, // Exclude orders without payments
          },
        },

        // Stage 4: Lookup Store details
        {
          $lookup: {
            from: 'stores',
            localField: 'storeId',
            foreignField: '_id',
            as: 'store',
          },
        },

        // Stage 5: Unwind store
        {
          $unwind: {
            path: '$store',
            preserveNullAndEmptyArrays: false,
          },
        },

        // Stage 6: Group by storeId and calculate totals
        {
          $group: {
            _id: '$storeId',
            storeName: { $first: '$store.name' },
            totalEarnings: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ifNull: ['$payment.finalPaymentInfo.capturedAmount', false] },
                      { $gt: ['$payment.finalPaymentInfo.capturedAmount', 0] },
                    ],
                  },
                  '$payment.finalPaymentInfo.capturedAmount',
                  // Fallback: Use order.total if capturedAmount is 0 or null
                  '$total',
                ],
              },
            },
            totalRefunds: {
              $sum: {
                $cond: [
                  { $ifNull: ['$payment.finalPaymentInfo.refundedAmount', false] },
                  '$payment.finalPaymentInfo.refundedAmount',
                  0,
                ],
              },
            },
            shippingCosts: {
              $sum: {
                $cond: [
                  { $eq: ['$shipping.subsidizedBy', 'merchant'] },
                  { $cond: [{ $ifNull: ['$shipping.cost', false] }, '$shipping.cost', 0] },
                  0,
                ],
              },
            },
            totalOrders: { $sum: 1 },
            bankingInfo: { $first: '$store.billing.bankingInfo' },
          },
        },

        // Stage 7: Calculate derived fields (amounts already in dollars)
        {
          $project: {
            _id: 0,
            storeId: { $toString: '$_id' },
            storeName: 1,
            totalEarnings: '$totalEarnings', // Already in dollars
            totalRefunds: '$totalRefunds', // Already in dollars
            shippingCosts: '$shippingCosts', // Already in dollars
            platformFee: { $multiply: ['$totalEarnings', 0.1] }, // 10% of totalEarnings
            netBalance: {
              $subtract: [
                '$totalEarnings',
                {
                  $add: ['$shippingCosts', { $multiply: ['$totalEarnings', 0.1] }],
                },
              ],
            },
            totalOrders: 1,
            completedOrders: '$totalOrders',
            bankingInfo: {
              $ifNull: [
                {
                  accountType: { $ifNull: ['$bankingInfo.accountType', ''] },
                  cbu: { $ifNull: ['$bankingInfo.cbu', ''] },
                  bankName: { $ifNull: ['$bankingInfo.bankName', ''] },
                  accountHolder: { $ifNull: ['$bankingInfo.accountHolder', ''] },
                  alias: { $ifNull: ['$bankingInfo.alias', ''] },
                },
                {
                  accountType: '',
                  cbu: '',
                  bankName: '',
                  accountHolder: '',
                  alias: '',
                },
              ],
            },
          },
        },

        // Stage 8: Sort
        {
          $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
        },
      ];

      // Get total count before pagination
      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await OrderModel.aggregate(countPipeline);
      const total = countResult.length > 0 ? countResult[0].total : 0;

      // Apply pagination
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      // Execute aggregation
      const stores = await OrderModel.aggregate(pipeline);

      // Debug logging
      console.log(`[StoreFinance] Found ${stores.length} stores with completed orders in last 7 days`);
      console.log('[StoreFinance] Date range: from', sevenDaysAgo.toISOString(), 'to', new Date().toISOString());
      console.log('[StoreFinance] Store names:', stores.map((s) => s.storeName).join(', '));
      if (stores.length > 0) {
        console.log('[StoreFinance] Sample store:', JSON.stringify(stores[0], null, 2));
      }

      return {
        stores: stores as StoreBalanceSummary[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in getAllStoreBalances:', error);
      throw new AppError('Error al obtener balances de tiendas', 500);
    }
  }

  /**
   * Get balance details for a single store
   */
  static async getStoreBalance(storeId: string): Promise<StoreBalanceSummary> {
    try {
      // Calculate date 7 days ago at start of day (00:00:00)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const pipeline: any[] = [
        // Stage 1: Match all orders for this store from last 7 days (regardless of status)
        {
          $match: {
            storeId: storeId,
            createdAt: { $gte: sevenDaysAgo },
          },
        },

        // Stage 2: Lookup Payment records
        {
          $lookup: {
            from: 'payments',
            localField: '_id',
            foreignField: 'orderId',
            as: 'payment',
          },
        },

        // Stage 3: Unwind payment
        {
          $unwind: {
            path: '$payment',
            preserveNullAndEmptyArrays: false,
          },
        },

        // Stage 4: Lookup Store details
        {
          $lookup: {
            from: 'stores',
            localField: 'storeId',
            foreignField: '_id',
            as: 'store',
          },
        },

        // Stage 5: Unwind store
        {
          $unwind: {
            path: '$store',
            preserveNullAndEmptyArrays: false,
          },
        },

        // Stage 6: Group by storeId
        {
          $group: {
            _id: '$storeId',
            storeName: { $first: '$store.name' },
            totalEarnings: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ifNull: ['$payment.finalPaymentInfo.capturedAmount', false] },
                      { $gt: ['$payment.finalPaymentInfo.capturedAmount', 0] },
                    ],
                  },
                  '$payment.finalPaymentInfo.capturedAmount',
                  '$total', // Fallback to order.total
                ],
              },
            },
            totalRefunds: {
              $sum: {
                $ifNull: ['$payment.finalPaymentInfo.refundedAmount', 0],
              },
            },
            shippingCosts: {
              $sum: {
                $cond: [{ $eq: ['$shipping.subsidizedBy', 'merchant'] }, { $ifNull: ['$shipping.cost', 0] }, 0],
              },
            },
            totalOrders: { $sum: 1 },
            bankingInfo: { $first: '$store.billing.bankingInfo' },
          },
        },

        // Stage 7: Calculate derived fields (amounts already in dollars)
        {
          $project: {
            _id: 0,
            storeId: { $toString: '$_id' },
            storeName: 1,
            totalEarnings: '$totalEarnings',
            totalRefunds: '$totalRefunds',
            shippingCosts: '$shippingCosts',
            platformFee: { $multiply: ['$totalEarnings', 0.1] },
            netBalance: {
              $subtract: [
                '$totalEarnings',
                {
                  $add: ['$shippingCosts', { $multiply: ['$totalEarnings', 0.1] }],
                },
              ],
            },
            totalOrders: 1,
            completedOrders: '$totalOrders',
            bankingInfo: {
              $ifNull: [
                {
                  accountType: { $ifNull: ['$bankingInfo.accountType', ''] },
                  cbu: { $ifNull: ['$bankingInfo.cbu', ''] },
                  bankName: { $ifNull: ['$bankingInfo.bankName', ''] },
                  accountHolder: { $ifNull: ['$bankingInfo.accountHolder', ''] },
                  alias: { $ifNull: ['$bankingInfo.alias', ''] },
                },
                {
                  accountType: '',
                  cbu: '',
                  bankName: '',
                  accountHolder: '',
                  alias: '',
                },
              ],
            },
          },
        },
      ];

      const result = await OrderModel.aggregate(pipeline);

      if (result.length === 0) {
        // Store exists but has no completed orders
        const store = await StoreModel.findById(storeId);
        if (!store) {
          throw new AppError('Tienda no encontrada', 404);
        }

        return {
          storeId: store._id.toString(),
          storeName: store.name,
          totalEarnings: 0,
          shippingCosts: 0,
          platformFee: 0,
          netBalance: 0,
          totalOrders: 0,
          completedOrders: 0,
          bankingInfo: store.billing?.bankingInfo || {
            accountType: 'cbu',
            cbu: '',
            bankName: '',
            accountHolder: '',
            alias: '',
          },
        };
      }

      return result[0] as StoreBalanceSummary;
    } catch (error) {
      console.error('Error in getStoreBalance:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Error al obtener balance de tienda', 500);
    }
  }

  /**
   * Get detailed order breakdown for a store
   */
  static async getStoreOrderDetails(storeId: string, options: FilterOptions = {}): Promise<StoreOrderDetails> {
    try {
      // First get the store balance summary
      const summary = await this.getStoreBalance(storeId);

      // Calculate date 7 days ago at start of day (00:00:00)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      // Build match criteria for all orders from last 7 days
      const matchCriteria: any = {
        storeId: storeId,
      };

      // Default to last 7 days if no date range specified
      if (options.startDate || options.endDate) {
        matchCriteria.createdAt = {};
        if (options.startDate) {
          matchCriteria.createdAt.$gte = options.startDate;
        }
        if (options.endDate) {
          matchCriteria.createdAt.$lte = options.endDate;
        }
      } else {
        // Default: last 7 days
        matchCriteria.createdAt = { $gte: sevenDaysAgo };
      }

      // Optional status filter
      if (options.status) {
        matchCriteria.status = options.status;
      }

      // Get orders with payment and customer details
      const pipeline: any[] = [
        // Stage 1: Match orders
        {
          $match: matchCriteria,
        },

        // Stage 2: Lookup Payment
        {
          $lookup: {
            from: 'payments',
            localField: '_id',
            foreignField: 'orderId',
            as: 'payment',
          },
        },

        // Stage 3: Unwind payment
        {
          $unwind: {
            path: '$payment',
            preserveNullAndEmptyArrays: false,
          },
        },

        // Stage 4: Lookup User (customer)
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'customer',
          },
        },

        // Stage 5: Unwind customer
        {
          $unwind: {
            path: '$customer',
            preserveNullAndEmptyArrays: true,
          },
        },

        // Stage 6: Project the fields we need (amounts already in dollars)
        {
          $project: {
            orderId: { $toString: '$_id' },
            orderDate: '$createdAt',
            customerName: {
              $concat: [{ $ifNull: ['$customer.name', 'N/A'] }, ' ', { $ifNull: ['$customer.surname', ''] }],
            },
            customerId: { $toString: '$userId' },
            orderTotal: '$total', // Already in dollars
            capturedAmount: {
              $cond: [
                {
                  $and: [
                    { $ifNull: ['$payment.finalPaymentInfo.capturedAmount', false] },
                    { $gt: ['$payment.finalPaymentInfo.capturedAmount', 0] },
                  ],
                },
                '$payment.finalPaymentInfo.capturedAmount',
                '$total', // Fallback to order.total
              ],
            },
            refundedAmount: {
              $ifNull: ['$payment.finalPaymentInfo.refundedAmount', 0],
            },
            shippingCost: { $ifNull: ['$shipping.cost', 0] },
            shippingSubsidizedBy: { $ifNull: ['$shipping.subsidizedBy', 'user'] },
            platformFee: {
              $multiply: [
                {
                  $cond: [
                    {
                      $and: [
                        { $ifNull: ['$payment.finalPaymentInfo.capturedAmount', false] },
                        { $gt: ['$payment.finalPaymentInfo.capturedAmount', 0] },
                      ],
                    },
                    '$payment.finalPaymentInfo.capturedAmount',
                    '$total', // Fallback
                  ],
                },
                0.1,
              ],
            },
            netToStore: {
              $subtract: [
                {
                  $cond: [
                    {
                      $and: [
                        { $ifNull: ['$payment.finalPaymentInfo.capturedAmount', false] },
                        { $gt: ['$payment.finalPaymentInfo.capturedAmount', 0] },
                      ],
                    },
                    '$payment.finalPaymentInfo.capturedAmount',
                    '$total', // Fallback
                  ],
                },
                {
                  $add: [
                    {
                      $cond: [{ $eq: ['$shipping.subsidizedBy', 'merchant'] }, { $ifNull: ['$shipping.cost', 0] }, 0],
                    },
                    {
                      $multiply: [
                        {
                          $cond: [
                            {
                              $and: [
                                { $ifNull: ['$payment.finalPaymentInfo.capturedAmount', false] },
                                { $gt: ['$payment.finalPaymentInfo.capturedAmount', 0] },
                              ],
                            },
                            '$payment.finalPaymentInfo.capturedAmount',
                            '$total', // Fallback
                          ],
                        },
                        0.1,
                      ],
                    },
                  ],
                },
              ],
            },
            status: '$status',
            paymentStatus: '$paymentStatus',
          },
        },

        // Stage 7: Sort by date descending (newest first)
        {
          $sort: { orderDate: -1 },
        },
      ];

      // Apply pagination if provided
      if (options.page && options.limit) {
        const skip = (options.page - 1) * options.limit;
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: options.limit });
      }

      const orders = await OrderModel.aggregate(pipeline);

      return {
        storeId: summary.storeId,
        storeName: summary.storeName,
        orders: orders as OrderFinancialDetail[],
        summary,
      };
    } catch (error) {
      console.error('Error in getStoreOrderDetails:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Error al obtener detalles de pedidos', 500);
    }
  }
}
