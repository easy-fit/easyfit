import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';
import { protect, restrictTo } from '../middlewares/auth';

export const checkoutRoutes = Router();

checkoutRoutes.use(protect);

checkoutRoutes
  .route('/')
  .get(restrictTo('admin'), CheckoutController.getCheckoutSessions)
  .post(
    restrictTo('admin', 'customer'),
    CheckoutController.createCheckoutSession,
  );
checkoutRoutes
  .route('/:id')
  .get(
    restrictTo('admin', 'customer'),
    CheckoutController.getCheckoutSessionById,
  )
  .patch(
    restrictTo('admin', 'customer'),
    CheckoutController.updateCheckoutSession,
  );

checkoutRoutes.post(
  '/:id/process-payment',
  restrictTo('admin', 'customer'),
  CheckoutController.processPayment,
);
