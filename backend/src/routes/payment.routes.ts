import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { protect, restrictTo } from '../middlewares/auth';

export const paymentRoutes = Router();

paymentRoutes.use(protect);
paymentRoutes.use(restrictTo('admin'));

paymentRoutes.route('/').get(PaymentController.getInternalPayments).post(PaymentController.createInternalPayment);

paymentRoutes
  .route('/:id')
  .get(PaymentController.getInternalPaymentById)
  .patch(PaymentController.updateInternalPayment)
  .delete(PaymentController.deleteInternalPayment);

paymentRoutes.get('/external/:externalId', PaymentController.getInternalPaymentByExternalId);
