import { Types } from 'mongoose';
import { StoreModel } from '../../models/store.model';
import { OrderModel } from '../../models/order.model';
import { OrderItemModel } from '../../models/orderItem.model';
import { CreateStoreDTO, UpdateStoreDTO, StoreFilterOptions } from '../../types/store.types';
import { AppError } from '../../utils/appError';
import { STORE_TAGS_VALUES } from '../../types/store.constants';
import { StoreAssetService } from './storeAsset.service';
import { StoreFilterService } from './storeFilter.service';
import { isDeliveryLocationValid } from '../../utils/distance';
import slugify from 'slugify';

export class StoreService {
  static async getStores(options: StoreFilterOptions = {}) {
    return StoreFilterService.getFilteredStores(options);
  }

  static async getStoreById(storeId: string) {
    const store = await StoreModel.findById(storeId);
    this.ensureStoreExists(store);
    return store;
  }

  static async setStoreStatus(storeId: string, status: 'active' | 'inactive') {
    const store = await StoreModel.findByIdAndUpdate(storeId, { status }, { new: true, runValidators: true });

    this.ensureStoreExists(store);
    return store;
  }

  static async getStoreStatus(storeId: string) {
    const store = await StoreModel.findById(storeId).select('status').lean();

    this.ensureStoreExists(store);
    return store?.status;
  }

  static async getStoreLocationById(storeId: string) {
    const store = await StoreModel.findById(storeId).select('address').lean();

    this.ensureStoreExists(store);
    return store?.address.location.coordinates;
  }

  static async getStoreBySlug(storeSlug: string) {
    const store = await StoreModel.findOne({ slug: storeSlug });
    this.ensureStoreExists(store);
    return store;
  }

  static async getStoreIdBySlug(storeSlug: string) {
    const store = await StoreModel.findOne({ slug: storeSlug }).select('_id').lean();

    this.ensureStoreExists(store);
    return store?._id;
  }

  static async createStore(data: CreateStoreDTO, userId: string) {
    const existingStore = await StoreModel.findOne({ name: data.name });
    if (existingStore) {
      throw new AppError('Store with this name already exists', 400);
    }

    if (data.address) {
      const storeCoordinates = {
        latitude: data.address.location.coordinates[1],   // coordinates stored as [lng, lat] in MongoDB
        longitude: data.address.location.coordinates[0],
      };

      const isValidDeliveryLocation = isDeliveryLocationValid(storeCoordinates);
      if (!isValidDeliveryLocation) {
        throw new AppError('Invalid delivery address', 400);
      }
    }

    this.checkStoreTags(data.tags);

    const slug = slugify(data.name, {
      lower: true,
      strict: true,
      trim: true,
    });

    const enhancedData = { ...data, merchantId: userId, slug };
    return StoreModel.create(enhancedData);
  }

  static async updateStore(storeId: string, data: UpdateStoreDTO) {
    if (data.tags) {
      this.checkStoreTags(data.tags);
    }

    if (data.address) {
      const storeCoordinates = {
        latitude: data.address.location.coordinates[1],
        longitude: data.address.location.coordinates[0],
      };

      const isValidDeliveryLocation = isDeliveryLocationValid(storeCoordinates);
      if (!isValidDeliveryLocation) {
        throw new AppError('Invalid delivery address', 400);
      }
    }

    const store = await StoreModel.findByIdAndUpdate(storeId, data, {
      new: true,
      runValidators: true,
    });

    this.ensureStoreExists(store);
    return store;
  }

  static async deleteStore(storeId: string) {
    const hasProducts = await this.hasProducts(storeId);
    if (hasProducts) {
      throw new AppError('Store cannot be deleted as it contains products. Please delete the products first.', 400);
    }
    await StoreModel.findByIdAndDelete(storeId);
  }

  // Asset management methods - delegated to StoreAssetService
  static async uploadStoreAsset(
    storeId: string,
    assetType: 'logo' | 'banner',
    fileData: { key: string; contentType: string },
  ) {
    return StoreAssetService.uploadAsset(storeId, assetType, fileData);
  }

  static async deleteStoreAsset(storeId: string, assetType: 'logo' | 'banner') {
    return StoreAssetService.deleteAsset(storeId, assetType);
  }

  private static ensureStoreExists(store: any): void {
    if (!store) {
      throw new AppError('Store not found', 404);
    }
  }

  private static async hasProducts(storeId: string): Promise<boolean> {
    const count = await StoreModel.countDocuments({ _id: storeId }).limit(1);
    return count > 0;
  }

  private static checkStoreTags(tags: string[]) {
    if (tags && tags.length > 0) {
      const invalidTags = tags.filter((tag) => !STORE_TAGS_VALUES.includes(tag as any));
      if (invalidTags.length > 0) {
        throw new AppError(`Invalid tags: ${invalidTags.join(', ')}`, 400);
      }
    }
  }

  // Order Analytics Methods
  static async getStoreOrderAnalytics(storeId: string) {
    const storeObjectId = new Types.ObjectId(storeId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    try {
      const [statusCounts, todayCounts, responseTimeData] = await Promise.all([
        // Count orders by status for all time
        OrderModel.aggregate([
          { $match: { storeId: storeObjectId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),

        // Count orders for today
        OrderModel.aggregate([
          {
            $match: {
              storeId: storeObjectId,
              createdAt: { $gte: today, $lt: tomorrow },
            },
          },
          {
            $group: {
              _id: null,
              totalToday: { $sum: 1 },
            },
          },
        ]),

        // Calculate average response time for accepted/rejected orders
        OrderModel.aggregate([
          {
            $match: {
              storeId: storeObjectId,
              status: { $in: ['order_accepted', 'order_canceled'] },
              updatedAt: { $exists: true },
            },
          },
          {
            $addFields: {
              responseTimeMs: { $subtract: ['$updatedAt', '$createdAt'] },
            },
          },
          {
            $group: {
              _id: null,
              avgResponseTimeMs: { $avg: '$responseTimeMs' },
            },
          },
        ]),
      ]);

      // Process status counts
      const statusMap = new Map(statusCounts.map((item) => [item._id, item.count]));
      const pending = statusMap.get('order_placed') || 0;
      const accepted = statusMap.get('order_accepted') || 0;
      const rejected = statusMap.get('order_canceled') || 0;

      // Process today's total
      const totalToday = todayCounts[0]?.totalToday || 0;

      // Process response time (convert ms to minutes)
      const avgResponseTimeMs = responseTimeData[0]?.avgResponseTimeMs || 0;
      const avgResponseTimeMinutes = Math.round((avgResponseTimeMs / (1000 * 60)) * 10) / 10;

      return {
        pending,
        accepted,
        rejected,
        totalToday,
        avgResponseTime: `${avgResponseTimeMinutes} min`,
      };
    } catch (error) {
      console.error('Error in getStoreOrderAnalytics:', error);
      throw new AppError('Error retrieving store order analytics', 500);
    }
  }

  static async getStoreOrders(
    storeId: string,
    filters: {
      status?: string;
      limit?: number;
      page?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const storeObjectId = new Types.ObjectId(storeId);
    const { status, limit = 10, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

    try {
      // Build match query
      const matchQuery: any = { storeId: storeObjectId };
      if (status) {
        matchQuery.status = status;
      }

      // Build sort query
      const sortQuery: any = {};
      sortQuery[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      const [orders, totalCount] = await Promise.all([
        OrderModel.find(matchQuery).populate('userId', 'name surname').sort(sortQuery).skip(skip).limit(limit).lean(),

        OrderModel.countDocuments(matchQuery),
      ]);

      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await OrderItemModel.find({ orderId: order._id })
            .populate({
              path: 'variantId',
              populate: {
                path: 'productId',
                select: 'title',
              },
              select: 'size color price sku productId',
            })
            .select('quantity unitPrice variantId')
            .lean();

          // Format items for frontend
          const formattedItems = items.map((item: any) => ({
            id: item._id.toString(),
            name: item.variantId?.productId?.title || 'Producto',
            variant: item.variantId ? `${item.variantId.color} / ${item.variantId.size}` : undefined,
            quantity: item.quantity,
            price: `$${item.unitPrice.toLocaleString('es-AR')}`,
            sku: item.variantId?.sku || 'N/A',
          }));

          // Calculate time since order was placed
          const orderCreatedAt = (order as any).createdAt;
          const createdAt = new Date(orderCreatedAt);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));

          let placedAt: string;
          if (diffMinutes < 1) {
            placedAt = 'Hace menos de 1 min';
          } else if (diffMinutes < 60) {
            placedAt = `Hace ${diffMinutes} min`;
          } else {
            const diffHours = Math.floor(diffMinutes / 60);
            if (diffHours < 24) {
              placedAt = `Hace ${diffHours}h`;
            } else {
              const diffDays = Math.floor(diffHours / 24);
              placedAt = `Hace ${diffDays}d`;
            }
          }

          const userId = order.userId as any;

          return {
            id: order._id.toString(),
            number: `#${order._id.toString().slice(-6).toUpperCase()}`,
            customer: userId && userId.name ? `${userId.name} ${userId.surname}` : 'Cliente',
            items: formattedItems,
            total: `$${order.total.toLocaleString('es-AR')}`,
            status: order.status,
            placedAt,
            createdAt: orderCreatedAt,
          };
        }),
      );

      const totalPages = Math.ceil(totalCount / limit);

      return {
        orders: ordersWithItems,
        pagination: {
          current: page,
          total: totalPages,
          count: totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error in getStoreOrders:', error);
      throw new AppError('Error retrieving store orders', 500);
    }
  }
}
