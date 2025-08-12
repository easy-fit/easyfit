import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';
import { protect, restrictTo, isKYCVerified, optionalAuth } from '../middlewares/auth';
import { verifyStoreOwnership } from '../middlewares/resourceAccess.middleware';

export const storeRoutes = Router();

storeRoutes
  .route('/')
  .get(optionalAuth, StoreController.getStores)
  .post(protect, restrictTo('admin', 'merchant'), isKYCVerified, StoreController.createStore);

storeRoutes.route('/:slug').get(StoreController.getStoreBySlug);

storeRoutes
  .route('/id/:id')
  .get(StoreController.getStoreById)
  .patch(protect, restrictTo('admin', 'merchant'), isKYCVerified, verifyStoreOwnership, StoreController.updateStore)
  .delete(protect, restrictTo('admin', 'merchant'), isKYCVerified, verifyStoreOwnership, StoreController.deleteStore);

storeRoutes
  .route('/id/:id/assets/:assetType')
  .post(protect, restrictTo('admin', 'merchant'), verifyStoreOwnership, StoreController.uploadStoreAsset)
  .delete(protect, restrictTo('admin', 'merchant'), verifyStoreOwnership, StoreController.deleteStoreAsset);

storeRoutes.get('/merchant/dashboard', protect, restrictTo('merchant'), StoreController.getMerchantDashboard);
storeRoutes
  .route('/id/:id/status')
  .patch(protect, restrictTo('admin', 'merchant'), verifyStoreOwnership, StoreController.setStoreStatus);

storeRoutes.get(
  '/id/:id/analytics/orders',
  protect,
  restrictTo('merchant'),
  verifyStoreOwnership,
  StoreController.getStoreOrderAnalytics,
);

storeRoutes.get(
  '/id/:id/orders',
  protect,
  restrictTo('merchant'),
  verifyStoreOwnership,
  StoreController.getStoreOrders,
);
