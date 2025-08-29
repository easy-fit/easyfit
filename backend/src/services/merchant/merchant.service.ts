import { Types } from 'mongoose';
import { StoreModel } from '../../models/store.model';
import { ProductModel } from '../../models/product.model';
import { OrderModel } from '../../models/order.model';
import { PaymentModel } from '../../models/payment.model';
import { AppError } from '../../utils/appError';

export class MerchantService {
  static async getDashboardData(merchantId: string) {
    const merchantObjectId = new Types.ObjectId(merchantId);

    try {
      // Get merchant's stores with basic info
      const stores = await StoreModel.find({ merchantId: merchantObjectId }).lean();

      if (stores.length === 0) {
        return {
          summary: {
            totalStores: 0,
            activeStores: 0,
            inactiveStores: 0,
            totalProducts: 0,
            totalOrders: 0,
            completedOrders: 0,
            weeklyRevenue: 0,
            weeklyRevenueChange: 0,
            weeklyProductGrowth: 0,
          },
          stores: [],
        };
      }

      const storeIds = stores.map((store) => store._id);

      // Parallel aggregation queries for efficiency
      const [productStats, orderStats, revenueStats, storeProductCounts] = await Promise.all([
        // Product statistics
        ProductModel.aggregate([
          { $match: { storeId: { $in: storeIds } } },
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              weeklyProducts: {
                $sum: {
                  $cond: {
                    if: { $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                    then: 1,
                    else: 0,
                  },
                },
              },
              previousWeekProducts: {
                $sum: {
                  $cond: {
                    if: {
                      $and: [
                        { $gte: ['$createdAt', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)] },
                        { $lt: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                      ],
                    },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
          },
        ]),

        // Order statistics
        OrderModel.aggregate([
          { $match: { storeId: { $in: storeIds } } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              completedOrders: {
                $sum: {
                  $cond: {
                    if: { $in: ['$status', ['purchased', 'return_completed']] },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
          },
        ]),

        // Revenue statistics (from payments)
        PaymentModel.aggregate([
          {
            $lookup: {
              from: 'orders',
              localField: 'orderId',
              foreignField: '_id',
              as: 'order',
            },
          },
          { $unwind: '$order' },
          { $match: { 'order.storeId': { $in: storeIds } } },
          {
            $group: {
              _id: null,
              weeklyRevenue: {
                $sum: {
                  $cond: {
                    if: {
                      $and: [
                        { $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                        { $eq: ['$type', 'capture'] },
                        { $eq: ['$status', 'approved'] },
                      ],
                    },
                    then: '$finalPaymentInfo.capturedAmount',
                    else: 0,
                  },
                },
              },
              previousWeekRevenue: {
                $sum: {
                  $cond: {
                    if: {
                      $and: [
                        { $gte: ['$createdAt', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)] },
                        { $lt: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                        { $eq: ['$type', 'capture'] },
                        { $eq: ['$status', 'approved'] },
                      ],
                    },
                    then: '$finalPaymentInfo.capturedAmount',
                    else: 0,
                  },
                },
              },
            },
          },
        ]),

        // Product count per store
        ProductModel.aggregate([
          { $match: { storeId: { $in: storeIds } } },
          {
            $group: {
              _id: '$storeId',
              productCount: { $sum: 1 },
            },
          },
        ]),
      ]);

      // Process results
      const productData = productStats[0] || { totalProducts: 0, weeklyProducts: 0, previousWeekProducts: 0 };
      const orderData = orderStats[0] || { totalOrders: 0, completedOrders: 0 };
      const revenueData = revenueStats[0] || { weeklyRevenue: 0, previousWeekRevenue: 0 };

      // Calculate growth percentages
      const weeklyProductGrowth =
        productData.previousWeekProducts > 0
          ? ((productData.weeklyProducts - productData.previousWeekProducts) / productData.previousWeekProducts) * 100
          : productData.weeklyProducts > 0
          ? 100
          : 0;

      const weeklyRevenueChange =
        revenueData.previousWeekRevenue > 0
          ? ((revenueData.weeklyRevenue - revenueData.previousWeekRevenue) / revenueData.previousWeekRevenue) * 100
          : revenueData.weeklyRevenue > 0
          ? 100
          : 0;

      // Create product count lookup
      const productCountMap = new Map(storeProductCounts.map((item) => [item._id.toString(), item.productCount]));

      // Count active/inactive stores
      const activeStores = stores.filter((store) => store.status === 'active').length;
      const inactiveStores = stores.length - activeStores;

      // Format store data
      const formattedStores = stores.map((store: any) => ({
        id: store._id.toString(),
        name: store.name,
        slug: store.slug,
        description: 'Tienda disponible en la plataforma', // Default description since there's no description field in the model
        productCount: productCountMap.get(store._id.toString()) || 0,
        address: store.address?.formatted
          ? `${store.address.formatted.street} ${store.address.formatted.streetNumber}, ${store.address.formatted.city}`
          : 'Dirección no especificada',
        rating: store.averageRating || 0,
        reviewCount: store.ratingCount || 0,
        status: store.status,
      }));

      return {
        summary: {
          totalStores: stores.length,
          activeStores,
          inactiveStores,
          totalProducts: productData.totalProducts,
          totalOrders: orderData.totalOrders,
          completedOrders: orderData.completedOrders,
          weeklyRevenue: Math.round(revenueData.weeklyRevenue / 100), // Convert from cents to pesos
          weeklyRevenueChange: Math.round(weeklyRevenueChange * 100) / 100, // Round to 2 decimals
          weeklyProductGrowth: productData.weeklyProducts,
        },
        stores: formattedStores,
      };
    } catch (error) {
      console.error('Error in MerchantService.getDashboardData:', error);
      throw new AppError('Error retrieving merchant dashboard data', 500);
    }
  }
}
