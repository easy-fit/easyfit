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
  .post(protect, restrictTo('admin', 'merchant'), isKYCVerified, verifyStoreOwnership, StoreController.uploadStoreAsset)
  .delete(
    protect,
    restrictTo('admin', 'merchant'),
    isKYCVerified,
    verifyStoreOwnership,
    StoreController.deleteStoreAsset,
  );
