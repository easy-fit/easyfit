import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { protect, restrictTo, isEmailVerified } from '../middlewares/auth';

export const orderRoutes = Router();

orderRoutes.use(protect);

orderRoutes.route('/').get(restrictTo('admin'), OrderController.getOrders);

orderRoutes
  .route('/:id')
  .get(OrderController.getOrderById)
  .patch(restrictTo('admin'), OrderController.updateOrder)
  .delete(restrictTo('admin'), OrderController.deleteOrder);
