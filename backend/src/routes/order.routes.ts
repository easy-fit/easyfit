import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

export const orderRoutes = Router();

orderRoutes
  .route('/')
  .get(OrderController.getOrders)
  .post(OrderController.createOrder);

orderRoutes
  .route('/:id')
  .get(OrderController.getOrderById)
  .patch(OrderController.updateOrder)
  .delete(OrderController.deleteOrder);
