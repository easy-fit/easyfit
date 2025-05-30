import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';

export const storeRoutes = Router();

storeRoutes
  .route('/')
  .get(StoreController.getStores)
  .post(StoreController.createStore);

storeRoutes
  .route('/:id')
  .get(StoreController.getStoreById)
  .patch(StoreController.updateStore)
  .delete(StoreController.deleteStore);
