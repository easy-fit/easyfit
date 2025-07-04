import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';
import { protect } from '../middlewares/auth';

export const checkoutRoutes = Router();

checkoutRoutes.use(protect);
checkoutRoutes.get('/', CheckoutController.getCheckoutSessions);
checkoutRoutes.get('/:id', CheckoutController.getCheckoutSessionById);
checkoutRoutes.post('/', CheckoutController.createCheckoutSession);
checkoutRoutes.patch('/:id', CheckoutController.updateCheckoutSession);
