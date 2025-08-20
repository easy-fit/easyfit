import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { protect, restrictTo } from '../middlewares/auth';
import { verifyOrderOwnership, verifyRiderOrderOwnership } from '../middlewares/resourceAccess.middleware';

export const orderRoutes = Router();

orderRoutes.use(protect);

orderRoutes.route('/').get(restrictTo('admin'), OrderController.getOrders);
orderRoutes.route('/my-orders').get(restrictTo('customer'), OrderController.getMyOrders);

orderRoutes
  .route('/:id')
  .get(verifyOrderOwnership, OrderController.getOrderById)
  .patch(restrictTo('admin'), OrderController.updateOrder)
  .delete(restrictTo('admin'), OrderController.deleteOrder);

orderRoutes
  .route('/:id/verify-delivery')
  .post(restrictTo('rider'), verifyRiderOrderOwnership, OrderController.verifyDeliveryCode);

orderRoutes
  .route('/try-period/:id/save-decisions')
  .patch(restrictTo('customer'), verifyOrderOwnership, OrderController.saveDecisionsAndFinalize);
