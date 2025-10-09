import { Request, Response } from 'express';
import { StoreService } from '../services/store/store.service';
import { MerchantService } from '../services/merchant/merchant.service';
import { StoreAnalyticsService } from '../services/store/storeAnalytics.service';
import { StoreManagerService } from '../services/storeManager.service';
import { catchAsync } from '../utils/catchAsync';
import { 
  CreateStoreDTO, 
  UpdateStoreDTO, 
  StoreFilterOptions,
  UpdateBillingDTO,
  UploadTaxDocumentDTO,
  UpdateDocumentStatusDTO,
  UpdateBillingStatusDTO
} from '../types/store.types';

export class StoreController {
  static getStores = catchAsync(async (req: Request, res: Response) => {
    const { tags, status, isOpen, rating, page = 1, lat, lng, distance, limit = 20, sort = '-createdAt' } = req.query;

    const filterOptions: StoreFilterOptions = {
      tags: tags ? (Array.isArray(tags) ? tags.map((tag) => String(tag)) : [String(tags)]) : undefined,
      status: status as string,
      isOpen: isOpen === 'true' ? true : isOpen === 'false' ? false : undefined,
      page: Number(page),
      limit: Number(limit),
      sort: sort as string,
      rating: rating ? Number(rating) : undefined,
    };

    if (lat && lng) {
      filterOptions.nearLocation = {
        latitude: Number(lat),
        longitude: Number(lng),
        maxDistance: distance ? Number(distance) : undefined,
      };
    } else if (req.user?.address?.location?.coordinates) {
      filterOptions.nearLocation = {
        latitude: req.user.address.location.coordinates[1],
        longitude: req.user.address.location.coordinates[0],
        maxDistance: distance ? Number(distance) : undefined,
      };
    }

    const result = await StoreService.getStores(filterOptions);

    res.status(200).json({
      status: 'success',
      results: result.stores.length,
      pagination: result.pagination,
      data: {
        stores: result.stores,
      },
    });
  });

  static getStoreById = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const store = await StoreService.getStoreById(storeId);
    res.status(200).json({ data: store });
  });

  static getStoreBySlug = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.slug;
    const store = await StoreService.getStoreBySlug(storeId);
    res.status(200).json({ data: store });
  });

  static createStore = catchAsync(async (req: Request, res: Response) => {
    const data: CreateStoreDTO = req.body;
    const userId = req.user._id;
    const store = await StoreService.createStore(data, userId);
    res.status(201).json({ data: store });
  });

  static updateStore = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const data: UpdateStoreDTO = req.body;
    const store = await StoreService.updateStore(storeId, data);
    res.status(200).json({ data: store });
  });

  static deleteStore = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    await StoreService.deleteStore(storeId);
    res.status(204).json({ status: 'success' });
  });

  static uploadStoreAsset = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const assetType = req.params.assetType as 'logo' | 'banner';
    const { key, contentType } = req.body;

    const result = await StoreService.uploadStoreAsset(storeId, assetType, {
      key,
      contentType: contentType || 'image/jpeg',
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  static deleteStoreAsset = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const assetType = req.params.assetType as 'logo' | 'banner';

    const store = await StoreService.deleteStoreAsset(storeId, assetType);

    res.status(200).json({
      status: 'success',
      data: { store },
    });
  });

  static getMerchantDashboard = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;

    const dashboardData = await MerchantService.getDashboardData(user._id);

    res.status(200).json({
      status: 'success',
      data: {
        dashboard: dashboardData,
      },
    });
  });

  static setStoreStatus = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const { status } = req.body;

    const store = await StoreService.setStoreStatus(storeId, status);
    res.status(200).json({ data: store });
  });

  static getStoreOrderAnalytics = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const analytics = await StoreService.getStoreOrderAnalytics(storeId);

    res.status(200).json({
      status: 'success',
      data: analytics,
    });
  });

  static getStoreOrders = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const { status, limit, page, sortBy, sortOrder, since } = req.query;

    const filters = {
      status: status as string,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      since: since as string,
    };

    const result = await StoreService.getStoreOrders(storeId, filters);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  static getStoreDetailedAnalytics = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const { dateRange = '7days', orderType = 'all' } = req.query;

    const analytics = await StoreAnalyticsService.getDetailedAnalytics(storeId, {
      dateRange: dateRange as string,
      orderType: orderType as string,
    });

    res.status(200).json({
      status: 'success',
      data: analytics,
    });
  });

  static getStoreProductMetrics = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    
    const metrics = await StoreService.getStoreProductMetrics(storeId);

    res.status(200).json({
      status: 'success',
      data: metrics,
    });
  });

  static getStoreProducts = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const { search, category, status, stockStatus, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const filterOptions = {
      search: search as string,
      category: category as string,
      status: status as string,
      stockStatus: stockStatus as string,
      page: Number(page),
      limit: Number(limit),
      sort: sort as string,
    };

    const result = await StoreService.getStoreProducts(storeId, filterOptions);

    res.status(200).json({
      status: 'success',
      results: result.products.length,
      pagination: result.pagination,
      data: {
        products: result.products,
      },
    });
  });

  static getManagerDashboard = catchAsync(async (req: Request, res: Response) => {
    const { user } = req;

    const assignments = await StoreManagerService.getManagerStores(user._id);

    // Format stores with consistent structure like merchant dashboard
    const stores = assignments.map(assignment => {
      const store = assignment.store as any;
      return {
        id: store._id,
        _id: store._id,
        name: store.name,
        address: store.address?.formatted ? 
          `${store.address.formatted.street} ${store.address.formatted.streetNumber || ''}, ${store.address.formatted.city}`.trim() :
          store.address,
        status: store.status,
        storeType: store.storeType,
        customization: store.customization,
        productCount: 0, // Managers don't need to see product count in dashboard
        rating: 0, // Managers don't need to see rating in dashboard
        reviewCount: 0, // Managers don't need to see review count in dashboard
        // Manager-specific info
        assignedAt: assignment.assignedAt,
        assignedBy: assignment.assignedByUser,
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        dashboard: {
          stores,
          summary: {
            totalStores: stores.length,
            activeStores: stores.filter(s => s.status === 'active').length,
            inactiveStores: stores.filter(s => s.status !== 'active').length,
          },
        },
      },
    });
  });

  static getUserStoreAccess = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const { user } = req;

    // Check if user owns the store
    const store = await StoreService.getStoreById(storeId);
    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Store not found',
      });
    }
    const isOwner = store.merchantId.toString() === user._id.toString();

    let isManager = false;
    let managerAssignment = null;

    if (!isOwner) {
      // Check if user is assigned as manager
      const assignments = await StoreManagerService.getManagerStores(user._id);
      const assignment = assignments.find(a => {
        // Handle both populated object and string ID
        const assignmentStoreId = (a.storeId as any)._id ? (a.storeId as any)._id.toString() : a.storeId.toString();
        return assignmentStoreId === storeId;
      });
      if (assignment && assignment.isActive) {
        isManager = true;
        managerAssignment = assignment;
      }
    }

    const hasAccess = isOwner || isManager;

    res.status(200).json({
      status: 'success',
      data: {
        storeId,
        hasAccess,
        accessType: isOwner ? 'owner' : isManager ? 'manager' : 'none',
        isOwner,
        isManager,
        managerAssignment,
      },
    });
  });

  // New Billing Management Endpoints
  static getStoreBilling = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const billing = await StoreService.getStoreBilling(storeId);

    res.status(200).json(billing);
  });

  static updateStoreBilling = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const data = req.body as UpdateBillingDTO;

    const billing = await StoreService.updateStoreBilling(storeId, data);

    res.status(200).json(billing);
  });

  static uploadTaxDocument = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const { fileName, type } = req.body as UploadTaxDocumentDTO;
    
    const result = await StoreService.uploadTaxDocument(storeId, { fileName, type });

    res.status(200).json(result);
  });

  static deleteDocument = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const documentId = req.params.documentId;

    const result = await StoreService.deleteDocument(storeId, documentId);

    res.status(200).json(result);
  });

  static updateDocumentStatus = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const documentId = req.params.documentId;
    const data = req.body as UpdateDocumentStatusDTO;

    const result = await StoreService.updateDocumentStatus(storeId, documentId, data);

    res.status(200).json(result);
  });

  static updateBillingStatus = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;
    const data = req.body as UpdateBillingStatusDTO;

    const billing = await StoreService.updateBillingStatus(storeId, data);

    res.status(200).json(billing);
  });

  static exportStoreProducts = catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.id;

    const result = await StoreService.exportStoreProducts(storeId);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });
}
