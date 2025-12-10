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

export class StoreFinanceService {
  /**
   * Get balances for all stores with pagination
   */
  static async getAllStoreBalances(
    options: PaginationOptions = {}
  ): Promise<PaginatedStoreBalances> {
    const { page = 1, limit = 50, sortBy = 'netBalance', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    try {
      // Aggregation pipeline to calculate store balances
      const pipeline: any[] = [
        // Stage 1: Match completed orders only
        {
          $match: {
            status: { $in: ['purchased', 'delivered'] },
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
                $ifNull: ['$payment.finalPaymentInfo.capturedAmount', 0],
              },
            },
            totalRefunds: {
              $sum: {
                $ifNull: ['$payment.finalPaymentInfo.refundedAmount', 0],
              },
            },
            shippingCosts: {
              $sum: {
                $cond: [
                  { $eq: ['$shipping.subsidizedBy', 'merchant'] },
                  { $ifNull: ['$shipping.cost', 0] },
                  0,
                ],
              },
            },
            totalOrders: { $sum: 1 },
            bankingInfo: { $first: '$store.billing.bankingInfo' },
          },
        },

        // Stage 7: Calculate derived fields
        {
          $project: {
            _id: 0,
            storeId: { $toString: '$_id' },
            storeName: 1,
            totalEarnings: 1,
            totalRefunds: 1,
            shippingCosts: 1,
            platformFee: { $multiply: ['$totalEarnings', 0.1] },
            netBalance: {
              $subtract: [
                '$totalEarnings',
                {
                  $add: [
                    '$shippingCosts',
                    { $multiply: ['$totalEarnings', 0.1] },
                  ],
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
      const pipeline: any[] = [
        // Stage 1: Match orders for this store only
        {
          $match: {
            storeId: storeId,
            status: { $in: ['purchased', 'delivered'] },
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
                $ifNull: ['$payment.finalPaymentInfo.capturedAmount', 0],
              },
            },
            totalRefunds: {
              $sum: {
                $ifNull: ['$payment.finalPaymentInfo.refundedAmount', 0],
              },
            },
            shippingCosts: {
              $sum: {
                $cond: [
                  { $eq: ['$shipping.subsidizedBy', 'merchant'] },
                  { $ifNull: ['$shipping.cost', 0] },
                  0,
                ],
              },
            },
            totalOrders: { $sum: 1 },
            bankingInfo: { $first: '$store.billing.bankingInfo' },
          },
        },

        // Stage 7: Calculate derived fields
        {
          $project: {
            _id: 0,
            storeId: { $toString: '$_id' },
            storeName: 1,
            totalEarnings: 1,
            totalRefunds: 1,
            shippingCosts: 1,
            platformFee: { $multiply: ['$totalEarnings', 0.1] },
            netBalance: {
              $subtract: [
                '$totalEarnings',
                {
                  $add: [
                    '$shippingCosts',
                    { $multiply: ['$totalEarnings', 0.1] },
                  ],
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
  static async getStoreOrderDetails(
    storeId: string,
    options: FilterOptions = {}
  ): Promise<StoreOrderDetails> {
    try {
      // First get the store balance summary
      const summary = await this.getStoreBalance(storeId);

      // Build match criteria for orders
      const matchCriteria: any = {
        storeId: storeId,
        status: { $in: ['purchased', 'delivered'] },
      };

      if (options.startDate || options.endDate) {
        matchCriteria.createdAt = {};
        if (options.startDate) {
          matchCriteria.createdAt.$gte = options.startDate;
        }
        if (options.endDate) {
          matchCriteria.createdAt.$lte = options.endDate;
        }
      }

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

        // Stage 6: Project the fields we need
        {
          $project: {
            orderId: { $toString: '$_id' },
            orderDate: '$createdAt',
            customerName: {
              $concat: [
                { $ifNull: ['$customer.name', 'N/A'] },
                ' ',
                { $ifNull: ['$customer.surname', ''] },
              ],
            },
            customerId: { $toString: '$userId' },
            orderTotal: '$total',
            capturedAmount: {
              $ifNull: ['$payment.finalPaymentInfo.capturedAmount', 0],
            },
            refundedAmount: {
              $ifNull: ['$payment.finalPaymentInfo.refundedAmount', 0],
            },
            shippingCost: { $ifNull: ['$shipping.cost', 0] },
            shippingSubsidizedBy: { $ifNull: ['$shipping.subsidizedBy', 'user'] },
            platformFee: {
              $multiply: [
                { $ifNull: ['$payment.finalPaymentInfo.capturedAmount', 0] },
                0.1,
              ],
            },
            netToStore: {
              $subtract: [
                { $ifNull: ['$payment.finalPaymentInfo.capturedAmount', 0] },
                {
                  $add: [
                    {
                      $cond: [
                        { $eq: ['$shipping.subsidizedBy', 'merchant'] },
                        { $ifNull: ['$shipping.cost', 0] },
                        0,
                      ],
                    },
                    {
                      $multiply: [
                        { $ifNull: ['$payment.finalPaymentInfo.capturedAmount', 0] },
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
