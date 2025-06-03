import { Router } from 'express';
import { ReturnDamageController } from '../controllers/returnDamage.controller';
import { protect, restrictTo, isEmailVerified } from '../middlewares/auth';

export const returnDamageRoutes = Router();

returnDamageRoutes.use(protect);
returnDamageRoutes.use(restrictTo('admin', 'merchant'));

returnDamageRoutes.use(isEmailVerified);
returnDamageRoutes
  .route('/')
  .get(restrictTo('admin'), ReturnDamageController.getRequests)
  .post(ReturnDamageController.createRequest);

returnDamageRoutes
  .route('/:id')
  .get(ReturnDamageController.getRequestById)
  .patch(ReturnDamageController.updateRequest)
  .delete(restrictTo('admin'), ReturnDamageController.deleteRequest);
