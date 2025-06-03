import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';
import { protect, restrictTo, isEmailVerified } from '../middlewares/auth';

export const storeRoutes = Router();

storeRoutes
  .route('/')
  .get(StoreController.getStores)
  .post(
    protect,
    restrictTo('admin', 'merchant'),
    isEmailVerified,
    StoreController.createStore,
  );

storeRoutes
  .route('/:id')
  .get(StoreController.getStoreById)
  .patch(
    protect,
    restrictTo('admin', 'merchant'),
    isEmailVerified,
    StoreController.updateStore,
  )
  .delete(
    protect,
    restrictTo('admin', 'merchant'),
    isEmailVerified,
    StoreController.deleteStore,
  );
