import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';
import { protect, restrictTo, isKYCVerified, optionalAuth } from '../middlewares/auth';
import { verifyStoreOwnership, verifyStoreAccess } from '../middlewares/resourceAccess.middleware';

export const storeRoutes = Router();

storeRoutes
  .route('/')
  .get(optionalAuth, StoreController.getStores)
  .post(protect, restrictTo('admin', 'merchant'), isKYCVerified, StoreController.createStore);

storeRoutes.route('/:slug').get(StoreController.getStoreBySlug);

storeRoutes
  .route('/id/:id')
  .get(protect, restrictTo('admin', 'merchant', 'manager'), verifyStoreAccess, StoreController.getStoreById)
  .patch(
    protect,
    restrictTo('admin', 'merchant', 'manager'),
    isKYCVerified,
    verifyStoreAccess,
    StoreController.updateStore,
  )
  .delete(protect, restrictTo('admin', 'merchant'), isKYCVerified, verifyStoreOwnership, StoreController.deleteStore);

storeRoutes
  .route('/id/:id/assets/:assetType')
  .post(protect, restrictTo('admin', 'merchant'), verifyStoreOwnership, StoreController.uploadStoreAsset)
  .delete(protect, restrictTo('admin', 'merchant'), verifyStoreOwnership, StoreController.deleteStoreAsset);

storeRoutes.get('/merchant/dashboard', protect, restrictTo('merchant'), StoreController.getMerchantDashboard);
storeRoutes.get('/manager/dashboard', protect, restrictTo('manager'), StoreController.getManagerDashboard);
storeRoutes.get('/id/:id/access', protect, restrictTo('merchant', 'manager'), StoreController.getUserStoreAccess);
storeRoutes
  .route('/id/:id/status')
  .patch(protect, restrictTo('admin', 'merchant', 'manager'), verifyStoreAccess, StoreController.setStoreStatus);

storeRoutes.get(
  '/id/:id/analytics/orders',
  protect,
  restrictTo('merchant', 'manager'),
  verifyStoreAccess,
  StoreController.getStoreOrderAnalytics,
);

storeRoutes.get(
  '/id/:id/orders',
  protect,
  restrictTo('merchant', 'manager'),
  verifyStoreAccess,
  StoreController.getStoreOrders,
);

storeRoutes.get(
  '/id/:id/analytics/detailed',
  protect,
  restrictTo('merchant', 'manager'),
  verifyStoreAccess,
  StoreController.getStoreDetailedAnalytics,
);

storeRoutes.get(
  '/id/:id/products/metrics',
  protect,
  restrictTo('merchant', 'manager'),
  verifyStoreAccess,
  StoreController.getStoreProductMetrics,
);

storeRoutes.get(
  '/id/:id/products',
  protect,
  restrictTo('merchant', 'manager'),
  verifyStoreAccess,
  StoreController.getStoreProducts,
);
