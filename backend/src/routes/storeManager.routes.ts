import { Router } from 'express';
import { StoreManagerController } from '../controllers/storeManager.controller';
import { protect, restrictTo, isKYCVerified } from '../middlewares/auth';
import { verifyStoreOwnershipByStoreId } from '../middlewares/resourceAccess.middleware';

export const storeManagerRoutes = Router();

// All routes require authentication
storeManagerRoutes.use(protect);
storeManagerRoutes.get('/my-stores', restrictTo('manager'), StoreManagerController.getManagerStores);
storeManagerRoutes.use(isKYCVerified);

// Store owner routes (merchants only)
storeManagerRoutes.use(restrictTo('merchant'));

// Get all managers for a specific store
storeManagerRoutes.get('/stores/:storeId/managers', verifyStoreOwnershipByStoreId, StoreManagerController.getStoreManagers);

// Assign manager to store
storeManagerRoutes.post('/assign', StoreManagerController.assignManagerToStore);

// Get specific manager assignment details
storeManagerRoutes.get(
  '/stores/:storeId/managers/:managerId',
  verifyStoreOwnershipByStoreId,
  StoreManagerController.getManagerAssignment,
);

// Remove manager from store
storeManagerRoutes.delete(
  '/stores/:storeId/managers/:managerId',
  verifyStoreOwnershipByStoreId,
  StoreManagerController.removeManagerFromStore,
);
