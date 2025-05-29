import { Router } from 'express';
import { ReturnDamageController } from '../controllers/returnDamage.controller';

export const returnDamageRoutes = Router();

returnDamageRoutes
  .route('/')
  .get(ReturnDamageController.getRequests)
  .post(ReturnDamageController.createRequest);

returnDamageRoutes
  .route('/:id')
  .get(ReturnDamageController.getRequestById)
  .patch(ReturnDamageController.updateRequest)
  .delete(ReturnDamageController.deleteRequest);
