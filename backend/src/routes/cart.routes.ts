import { Router } from 'express';
import { CartItemController } from '../controllers/cart.controller';
import { protect, restrictTo, isEmailVerified } from '../middlewares/auth';

export const cartRoutes = Router();

cartRoutes.use(protect, isEmailVerified, restrictTo('user', 'admin'));

cartRoutes
  .route('/')
  .get(CartItemController.getCartItems)
  .post(CartItemController.addCartItem)
  .delete(CartItemController.clearCart);

cartRoutes
  .route('/:id')
  .delete(CartItemController.removeCartItem)
  .patch(CartItemController.updateCartItemQuantity);
