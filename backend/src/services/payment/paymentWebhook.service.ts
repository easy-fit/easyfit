import { AppError } from '../../utils/appError';
import { PaymentService } from './payment.service';
import { CheckoutService } from '../checkout/checkout.service';
import { PaymentMercadoPagoService } from './paymentMercadoPago.service';

export class PaymentWebhookService {
  static async handleMercadoPagoWebhook(payload: any) {
    try {
      if (
        payload.action === 'payment.created' ||
        payload.action === 'payment.updated'
      ) {
        const paymentId = payload.data?.id;

        if (!paymentId) {
          console.log('No payment ID in webhook payload');
          return;
        }

        const existingPayment = await PaymentService.getPaymentByExternalId(
          paymentId.toString(),
        );

        if (existingPayment) {
          console.log(
            `Payment ${paymentId} already processed via process-payment endpoint`,
          );
          return;
        }

        const payment = await PaymentMercadoPagoService.getPayment(paymentId);

        const externalRef = payment.external_reference;
        if (!externalRef || !externalRef.startsWith('session-')) {
          console.log('Invalid external_reference format:', externalRef);
          return;
        }

        const sessionId = externalRef.replace('session-', '');

        if (payment.status === 'approved') {
          await CheckoutService.completePaymentFromWebhook(sessionId, payment);
        } else if (
          payment.status === 'rejected' ||
          payment.status === 'cancelled'
        ) {
          await CheckoutService.handleFailedPayment(sessionId, payment);
        }

        console.log(
          `Payment ${paymentId} processed via webhook with status: ${payment.status}`,
        );
      }
    } catch (error: any) {
      console.error('Error processing MercadoPago webhook:', error.message);
      throw new AppError('Webhook processing failed', 500);
    }
  }
}