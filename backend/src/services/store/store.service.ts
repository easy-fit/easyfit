import { Types } from 'mongoose';
import { StoreModel } from '../../models/store.model';
import { OrderModel } from '../../models/order.model';
import { OrderItemModel } from '../../models/orderItem.model';
import { ProductModel } from '../../models/product.model';
import { VariantModel } from '../../models/variant.model';
import {
  CreateStoreDTO,
  UpdateStoreDTO,
  StoreFilterOptions,
  UpdateBillingDTO,
  UploadTaxDocumentDTO,
  UpdateDocumentStatusDTO,
  UpdateBillingStatusDTO,
  StoreBilling,
  BillingResponse,
  DocumentType,
  TaxDocument,
} from '../../types/store.types';
import { AppError } from '../../utils/appError';
import { STORE_TAGS_VALUES } from '../../types/store.constants';
import { StoreAssetService } from './storeAsset.service';
import { StoreTaxDocumentService } from './storeTaxDocument.service';
import { StoreFilterService } from './storeFilter.service';
import { isDeliveryLocationValid } from '../../utils/distance';
import { CategoryUtils } from '../../utils/categoryUtils';
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
    const store = await StoreModel.findById(storeId);
    // Check if store can be activated
    if (status === 'active' && store?.billing.status !== 'accepted') {
      throw new AppError('Store cannot be activated. Billing must be approved first.', 400);
    }
    // update store status
    if (store) {
      store.status = status;
      await store.save();
    }
    return store;
  }

  static async getStoreStatus(storeId: string) {
    const store = await StoreModel.findById(storeId).select('status isOpen').lean();

    this.ensureStoreExists(store);
    return store;
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
        latitude: data.address.location.coordinates[0], // coordinates stored as [lng, lat] in MongoDB
        longitude: data.address.location.coordinates[1],
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
        latitude: data.address.location.coordinates[0],
        longitude: data.address.location.coordinates[1],
      };

      const isValidDeliveryLocation = isDeliveryLocationValid(storeCoordinates);
      if (!isValidDeliveryLocation) {
        throw new AppError('Invalid delivery address', 400);
      }
    }

    // Check billing requirements when trying to open store
    if (data.isOpen === true) {
      const currentStore = await StoreModel.findById(storeId);
      if (!currentStore) {
        throw new AppError('Store not found', 404);
      }

      if (currentStore.billing?.status !== 'accepted') {
        throw new AppError(
          'Store cannot be opened. Billing information must be approved first. Please complete your billing profile and wait for approval.',
          400,
        );
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
      since?: string;
    } = {},
  ) {
    const storeObjectId = new Types.ObjectId(storeId);
    const { status, limit = 10, page = 1, sortBy = 'createdAt', sortOrder = 'desc', since } = filters;

    try {
      // Build match query
      const matchQuery: any = { storeId: storeObjectId };
      if (status) {
        // Handle comma-separated status values
        const statusArray = status.includes(',') ? status.split(',').map((s) => s.trim()) : [status];
        matchQuery.status = statusArray.length > 1 ? { $in: statusArray } : status;
      }
      if (since) {
        // Filter orders created after the specified timestamp
        matchQuery.createdAt = { $gte: new Date(since) };
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

      // Batch fetch all order items for these orders
      const orderIds = orders.map((order) => order._id);

      // Build item query for all orders
      const itemQuery: any = { orderId: { $in: orderIds } };
      if (status === 'store_checking_returns') {
        itemQuery.returnStatus = 'returned';
      }

      // Fetch all order items in one go
      const items = await OrderItemModel.find(itemQuery)
        .populate({
          path: 'variantId',
          populate: {
            path: 'productId',
            select: 'title',
          },
          select: 'size color price sku productId images',
        })
        .select('quantity unitPrice variantId returnStatus orderId')
        .lean();

      // Group items by orderId
      const itemsByOrderId: Record<string, any[]> = {};
      for (const item of items) {
        const key = item.orderId.toString();
        if (!itemsByOrderId[key]) itemsByOrderId[key] = [];
        itemsByOrderId[key].push(item);
      }

      // Format orders with their items
      const ordersWithItems = orders.map((order) => {
        const orderIdStr = order._id.toString();
        const orderItems = itemsByOrderId[orderIdStr] || [];

        // Format items for frontend
        const formattedItems = orderItems.map((item: any) => ({
          id: item._id.toString(),
          name: item.variantId?.productId?.title || 'Producto',
          variant: item.variantId ? `${item.variantId.color} / ${item.variantId.size}` : undefined,
          quantity: item.quantity,
          price: `$${item.unitPrice.toLocaleString('es-AR')}`,
          sku: item.variantId?.sku || 'N/A',
          // Include additional fields needed for inspection modal
          returnStatus: item.returnStatus,
          variantId: {
            _id: item.variantId?._id?.toString(),
            size: item.variantId?.size,
            color: item.variantId?.color,
            images: item.variantId?.images || [],
          },
          product: {
            _id: item.variantId?.productId?._id?.toString(),
            title: item.variantId?.productId?.title || 'Producto',
            category: 'clothing', // Default category
          },
          unitPrice: item.unitPrice,
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
          number: `#${order._id.toString().slice(-4).toUpperCase()}`,
          customer: userId && userId.name ? `${userId.name} ${userId.surname}` : 'Cliente',
          items: formattedItems,
          total: `$${order.total.toLocaleString('es-AR')}`,
          status: order.status,
          placedAt,
          createdAt: orderCreatedAt,
          deliveryType: (order as any).shipping?.type,
        };
      });

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

  // Product Management Methods
  static async getStoreProductMetrics(storeId: string) {
    const storeObjectId = new Types.ObjectId(storeId);

    try {
      const [productStats, categoryBreakdown, stockStats] = await Promise.all([
        // Basic product counts by status
        ProductModel.aggregate([
          { $match: { storeId: storeObjectId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),

        // Category breakdown using new hierarchical categories
        ProductModel.aggregate([
          { $match: { storeId: storeObjectId, status: 'published' } },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),

        // Stock status analysis
        ProductModel.aggregate([
          { $match: { storeId: storeObjectId, status: 'published' } },
          {
            $lookup: {
              from: 'variants',
              localField: '_id',
              foreignField: 'productId',
              as: 'variants',
            },
          },
          {
            $addFields: {
              totalStock: { $sum: '$variants.stock' },
              variantCount: { $size: '$variants' },
            },
          },
          {
            $addFields: {
              stockStatus: {
                $cond: {
                  if: { $eq: ['$totalStock', 0] },
                  then: 'out-of-stock',
                  else: {
                    $cond: {
                      if: { $and: [{ $gt: ['$totalStock', 0] }, { $lte: ['$totalStock', 10] }] },
                      then: 'low-stock',
                      else: 'in-stock',
                    },
                  },
                },
              },
            },
          },
          {
            $group: {
              _id: '$stockStatus',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      // Process product stats
      const statusMap = new Map(productStats.map((item) => [item._id, item.count]));
      const totalProducts = productStats.reduce((sum, item) => sum + item.count, 0);
      const publishedProducts = statusMap.get('published') || 0;
      const draftProducts = statusMap.get('draft') || 0;

      // Process stock stats
      const stockMap = new Map(stockStats.map((item) => [item._id, item.count]));
      const lowStockCount = stockMap.get('low-stock') || 0;
      const outOfStockCount = stockMap.get('out-of-stock') || 0;

      // Process category breakdown with display names
      const processedCategories = categoryBreakdown.reduce((acc, item) => {
        const displayName = CategoryUtils.getCategoryDisplayName(item._id);
        const gender = CategoryUtils.getCategoryGender(item._id);

        if (gender) {
          const genderKey = CategoryUtils.getMainCategoryDisplayName(gender);
          acc[genderKey] = (acc[genderKey] || 0) + item.count;
        }

        return acc;
      }, {} as Record<string, number>);

      // Find most popular category
      const topCategory = Object.entries(processedCategories).sort(([, a], [, b]) => (b as number) - (a as number))[0];

      return {
        totalProducts,
        publishedProducts,
        draftProducts,
        lowStockCount: lowStockCount + outOfStockCount, // Combine low and out of stock
        topCategory: topCategory
          ? {
              name: topCategory[0],
              count: topCategory[1],
            }
          : {
              name: 'Sin productos',
              count: 0,
            },
        categoriesBreakdown: processedCategories,
        stockBreakdown: {
          inStock: stockMap.get('in-stock') || 0,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
        },
      };
    } catch (error) {
      console.error('Error in getStoreProductMetrics:', error);
      throw new AppError('Error retrieving store product metrics', 500);
    }
  }

  static async getStoreProducts(
    storeId: string,
    filters: {
      search?: string;
      category?: string;
      status?: string;
      stockStatus?: string;
      page?: number;
      limit?: number;
      sort?: string;
    } = {},
  ) {
    const storeObjectId = new Types.ObjectId(storeId);
    const { search, category, status, stockStatus, page = 1, limit = 20, sort = '-createdAt' } = filters;

    try {
      // Build match query
      const matchQuery: any = { storeId: storeObjectId };

      if (search) {
        matchQuery.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      if (category && category !== 'all') {
        matchQuery.category = { $regex: `^${category}`, $options: 'i' };
      }

      if (status && status !== 'all') {
        matchQuery.status = status;
      }

      // Build sort query
      const sortQuery: any = {};
      if (sort.startsWith('-')) {
        sortQuery[sort.substring(1)] = -1;
      } else {
        sortQuery[sort] = 1;
      }

      // Build aggregation pipeline
      const pipeline: any[] = [
        { $match: matchQuery },
        {
          $lookup: {
            from: 'variants',
            localField: '_id',
            foreignField: 'productId',
            as: 'variants',
          },
        },
        {
          $addFields: {
            variants: {
              $map: {
                input: '$variants',
                as: 'variant',
                in: {
                  $mergeObjects: [
                    '$$variant',
                    {
                      finalPrice: {
                        $cond: {
                          if: { $gt: [{ $ifNull: ['$$variant.discount', 0] }, 0] },
                          then: {
                            $subtract: [
                              '$$variant.price',
                              { $multiply: ['$$variant.price', { $divide: ['$$variant.discount', 100] }] }
                            ]
                          },
                          else: '$$variant.price'
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $addFields: {
            variantCount: { $size: '$variants' },
            totalStock: {
              $cond: {
                if: { $eq: [{ $size: '$variants' }, 0] },
                then: 0,
                else: { $sum: '$variants.stock' },
              },
            },
            minPrice: { $min: '$variants.finalPrice' },
            maxPrice: { $max: '$variants.finalPrice' },
            minOriginalPrice: { $min: '$variants.price' },
            maxOriginalPrice: { $max: '$variants.price' },
            maxDiscount: { $max: '$variants.discount' },

            defaultVariant: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$variants',
                    cond: { $eq: ['$$this.isDefault', true] },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $addFields: {
            stockStatus: {
              $switch: {
                branches: [
                  {
                    case: { $or: [{ $eq: ['$totalStock', 0] }, { $eq: ['$totalStock', null] }] },
                    then: 'out-of-stock',
                  },
                  {
                    case: { $and: [{ $gt: ['$totalStock', 0] }, { $lte: ['$totalStock', 10] }] },
                    then: 'low-stock',
                  },
                ],
                default: 'in-stock',
              },
            },
          },
        },
        {
          $addFields: {
            defaultImageKey: {
              $let: {
                vars: {
                  firstVariant: { $arrayElemAt: ['$variants', 0] },
                },
                in: {
                  $cond: {
                    if: {
                      $and: [
                        { $ne: ['$$firstVariant', null] },
                        { $isArray: '$$firstVariant.images' },
                        { $gt: [{ $size: '$$firstVariant.images' }, 0] },
                      ],
                    },
                    then: { $arrayElemAt: ['$$firstVariant.images.key', 0] },
                    else: null,
                  },
                },
              },
            },
          },
        },
      ];

      // Add stock status filter before pagination if specified
      if (stockStatus && stockStatus !== 'all') {
        pipeline.push({ $match: { stockStatus: stockStatus } });
      }

      pipeline.push(
        {
          $project: {
            _id: 1,
            title: 1,
            category: 1,
            status: 1,
            createdAt: 1,
            variantCount: 1,
            totalStock: 1,
            stockStatus: 1,
            minPrice: 1,
            maxPrice: 1,
            minOriginalPrice: 1,
            maxOriginalPrice: 1,
            maxDiscount: 1,
            defaultImageKey: 1,
            slug: 1,
          },
        },
        { $sort: sortQuery },
      );

      // Calculate total count before pagination
      const countPipeline = [...pipeline, { $count: 'total' }];

      // Add pagination
      const skip = (page - 1) * limit;
      pipeline.push({ $skip: skip }, { $limit: limit });

      const [products, countResult] = await Promise.all([
        ProductModel.aggregate(pipeline),
        ProductModel.aggregate(countPipeline),
      ]);

      const totalCount = countResult.length > 0 ? countResult[0].total : 0;
      const filteredProducts = products;

      // Format products for frontend
      const formattedProducts = filteredProducts.map((product) => ({
        id: product._id.toString(),
        name: product.title,
        category: CategoryUtils.getCategoryDisplayName(product.category),
        categoryKey: product.category,
        image: product.defaultImageKey || '/placeholder.svg?height=64&width=64',
        variants: product.variantCount,
        stock: {
          total: product.totalStock,
          status: product.stockStatus,
        },
        price: {
          min: product.minPrice,
          max: product.maxPrice,
          originalMin: product.minOriginalPrice,
          originalMax: product.maxOriginalPrice,
          discountPercentage: product.maxDiscount || 0,
        },
        status: product.status,
        createdAt: product.createdAt.toISOString().split('T')[0],
        slug: product.slug,
      }));

      const totalPages = Math.ceil(totalCount / limit);

      return {
        products: formattedProducts,
        pagination: {
          current: page,
          total: totalPages,
          count: totalCount,
          pages: totalPages,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error in getStoreProducts:', error);
      throw new AppError('Error retrieving store products', 500);
    }
  }

  static async exportStoreProducts(storeId: string) {
    const storeObjectId = new Types.ObjectId(storeId);

    try {
      // Fetch ALL products with all their variants (no pagination)
      const products = await ProductModel.aggregate([
        { $match: { storeId: storeObjectId } },
        {
          $lookup: {
            from: 'variants',
            localField: '_id',
            foreignField: 'productId',
            as: 'variants',
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            category: 1,
            status: 1,
            variants: {
              _id: 1,
              sku: 1,
              size: 1,
              color: 1,
              price: 1,
              stock: 1,
            },
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      // Flatten products into rows (one row per variant)
      const exportData = products.flatMap((product) =>
        product.variants.map((variant: any) => ({
          productId: product._id.toString(),
          productTitle: product.title,
          category: CategoryUtils.getCategoryDisplayName(product.category),
          categoryKey: product.category,
          status: product.status,
          variantId: variant._id.toString(),
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          price: variant.price,
          stock: variant.stock,
        })),
      );

      return exportData;
    } catch (error) {
      console.error('Error in exportStoreProducts:', error);
      throw new AppError('Error exporting store products', 500);
    }
  }

  // Billing Management Methods
  private static isBillingComplete(billing: any): boolean {
    if (!billing) return false;

    // Check fiscal info completeness
    const fiscalComplete =
      billing.fiscalInfo && billing.fiscalInfo.cuit && billing.fiscalInfo.businessName && billing.fiscalInfo.taxStatus;

    // Check banking info completeness
    const bankingComplete =
      billing.bankingInfo &&
      billing.bankingInfo.bankName &&
      billing.bankingInfo.accountHolder &&
      billing.bankingInfo.cbu;

    // Check if at least one tax document exists and is approved
    const docsComplete =
      billing.taxDocuments &&
      billing.taxDocuments.length > 0 &&
      billing.taxDocuments.some((doc: any) => doc.status === 'approved');

    return !!(fiscalComplete && bankingComplete && docsComplete);
  }

  static async getStoreBilling(storeId: string): Promise<BillingResponse> {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new AppError('Invalid store ID', 400);
    }

    const store = await StoreModel.findById(storeId);
    if (!store) {
      throw new AppError('Store not found', 404);
    }

    return {
      status: 'success',
      data: store.billing,
    };
  }

  static async updateStoreBilling(storeId: string, data: UpdateBillingDTO): Promise<BillingResponse> {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new AppError('Invalid store ID', 400);
    }

    const updateData: any = {
      'billing.lastUpdatedAt': new Date(),
    };

    if (data.fiscalInfo) {
      Object.keys(data.fiscalInfo).forEach((key) => {
        updateData[`billing.fiscalInfo.${key}`] = data.fiscalInfo![key as keyof typeof data.fiscalInfo];
      });
    }

    if (data.bankingInfo) {
      Object.keys(data.bankingInfo).forEach((key) => {
        updateData[`billing.bankingInfo.${key}`] = data.bankingInfo![key as keyof typeof data.bankingInfo];
      });
    }

    const store = await StoreModel.findByIdAndUpdate(storeId, updateData, { new: true, runValidators: false });

    if (!store) {
      throw new AppError('Store not found', 404);
    }

    // Check if billing is now complete and auto-approve if so
    if (store.billing.status === 'pending' && this.isBillingComplete(store.billing)) {
      const autoApprovalUpdate = {
        'billing.status': 'accepted',
        'billing.completedAt': new Date(),
        'billing.lastUpdatedAt': new Date(),
      };

      const updatedStore = await StoreModel.findByIdAndUpdate(storeId, autoApprovalUpdate, {
        new: true,
        runValidators: false,
      });
      if (updatedStore) {
        return {
          status: 'success',
          data: updatedStore.billing,
        };
      }
    }

    return {
      status: 'success',
      data: store.billing,
    };
  }

  static async uploadTaxDocument(
    storeId: string,
    documentData: { fileName: string; type: DocumentType },
  ): Promise<{ status: string; data: { billing: StoreBilling; uploadInfo: { key: string; url: string } } }> {
    const result = await StoreTaxDocumentService.uploadTaxDocument(storeId, documentData);

    return {
      status: 'success',
      data: result,
    };
  }

  static async deleteDocument(
    storeId: string,
    documentId: string,
  ): Promise<{ status: string; data: { billing: StoreBilling } }> {
    const result = await StoreTaxDocumentService.deleteTaxDocument(storeId, documentId);

    return {
      status: 'success',
      data: result,
    };
  }

  static async updateDocumentStatus(
    storeId: string,
    documentId: string,
    data: UpdateDocumentStatusDTO,
  ): Promise<{ status: string; data: { billing: StoreBilling } }> {
    const result = await StoreTaxDocumentService.updateDocumentStatus(storeId, documentId, data);

    return {
      status: 'success',
      data: result,
    };
  }

  static async updateBillingStatus(storeId: string, data: UpdateBillingStatusDTO): Promise<BillingResponse> {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new AppError('Invalid store ID', 400);
    }

    const updateData: any = {
      'billing.status': data.status,
      'billing.lastUpdatedAt': new Date(),
    };

    if (data.status === 'accepted') {
      updateData['billing.completedAt'] = new Date();
    }

    const updatedStore = await StoreModel.findByIdAndUpdate(storeId, updateData, { new: true });

    if (!updatedStore) {
      throw new AppError('Store not found', 404);
    }

    return {
      status: 'success',
      data: updatedStore.billing,
    };
  }

  // Override setStoreStatus to check billing requirements
  // static async setStoreStatus(storeId: string, status: 'active' | 'inactive') {
  //   if (!Types.ObjectId.isValid(storeId)) {
  //     throw new AppError('Invalid store ID', 400);
  //   }

  //   const store = await StoreModel.findById(storeId);
  //   if (!store) {
  //     throw new AppError('Store not found', 404);
  //   }

  //   // Check if store can be activated
  //   if (status === 'active' && store.billing.status !== 'accepted') {
  //     throw new AppError('Store cannot be activated. Billing must be approved first.', 400);
  //   }

  //   const updatedStore = await StoreModel.findByIdAndUpdate(
  //     storeId,
  //     { status },
  //     { new: true }
  //   );

  //   return updatedStore;
  // }
}
