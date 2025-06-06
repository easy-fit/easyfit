import { Router } from 'express';
import { ReturnDamageController } from '../controllers/returnDamage.controller';
import { protect, restrictTo, isKYCVerified } from '../middlewares/auth';

export const returnDamageRoutes = Router();

returnDamageRoutes.use(protect);
returnDamageRoutes.use(restrictTo('admin', 'merchant'));

returnDamageRoutes.use(isKYCVerified);
returnDamageRoutes
  .route('/')
  .get(restrictTo('admin'), ReturnDamageController.getRequests)
  .post(ReturnDamageController.createRequest);

returnDamageRoutes
  .route('/:id')
  .get(ReturnDamageController.getRequestById)
  .patch(ReturnDamageController.updateRequest)
  .delete(restrictTo('admin'), ReturnDamageController.deleteRequest);
