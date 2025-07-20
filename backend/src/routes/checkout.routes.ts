import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';
import { protect, restrictTo, isEmailVerified } from '../middlewares/auth';

export const checkoutRoutes = Router();

checkoutRoutes.use(protect);
checkoutRoutes.use(isEmailVerified);

checkoutRoutes
  .route('/')
  .get(restrictTo('admin'), CheckoutController.getCheckoutSessions)
  .post(restrictTo('customer'), CheckoutController.createCheckoutSession);
checkoutRoutes
  .route('/:id')
  .get(restrictTo('customer'), CheckoutController.getCheckoutSessionById)
  .patch(restrictTo('customer'), CheckoutController.updateCheckoutSession);

checkoutRoutes.post('/:id/process-payment', restrictTo('customer'), CheckoutController.processPayment);
