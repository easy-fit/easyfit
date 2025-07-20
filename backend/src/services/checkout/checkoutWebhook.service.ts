import { CheckoutSessionModel } from '../../models/checkout.model';
import { AppError } from '../../utils/appError';
import { PaymentService } from '../payment/payment.service';
import { OrderService } from '../order.service';
import { MercadoPagoService } from '../payment/mercadoPago.service';
import { VariantService } from '../variant/variant.service';
import { CheckoutPaymentService } from './checkoutPayment.service';
import { CheckoutService } from './checkout.service';

export class CheckoutWebhookService {
  static async handleMercadoPagoWebhook(payload: any) {
    try {
      if (payload.action === 'payment.created' || payload.action === 'payment.updated') {
        const paymentId = payload.data?.id;

        if (!paymentId) {
          console.log('No payment ID in webhook payload');
          return;
        }

        const existingPayment = await PaymentService.getInternalPaymentByExternalId(paymentId.toString());

        if (existingPayment) {
          console.log(`Payment ${paymentId} already processed via process-payment endpoint`);
          return;
        }

        const payment = await MercadoPagoService.getPayment(paymentId);

        const externalRef = payment.external_reference;
        if (!externalRef || !externalRef.startsWith('session-')) {
          console.log('Invalid external_reference format:', externalRef);
          return;
        }

        const sessionId = externalRef.replace('session-', '');

        if (payment.status === 'approved') {
          await this.completePaymentFromWebhook(sessionId, payment);
        } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
          await this.handleFailedPayment(sessionId, payment);
        }

        console.log(`Payment ${paymentId} processed via webhook with status: ${payment.status}`);
      }
    } catch (error: any) {
      console.error('Error processing MercadoPago webhook:', error.message);
      throw new AppError('Webhook processing failed', 500);
    }
  }

  static async completePaymentFromWebhook(sessionId: string, payment: any) {
    const session = await CheckoutService.getCheckoutSessionById(sessionId);

    if (session.status !== 'active') {
      throw new AppError(`Cannot complete payment for session with status: ${session.status}`, 400);
    }

    const isStockAvailable = await VariantService.checkStockAvailableForItems(session.cartItems);
    if (!isStockAvailable) {
      await this.handleStockFailureRefund(sessionId, payment, session);
      throw new AppError('Stock unavailable, payment refunded', 400);
    }

    return await this.createOrderAndCompletePayment(sessionId, payment, session);
  }

  static async handleFailedPayment(sessionId: string, payment: any) {
    try {
      const session = await CheckoutService.getCheckoutSessionById(sessionId);

      if (session.status === 'active') {
        await CheckoutSessionModel.findByIdAndUpdate(sessionId, {
          status: 'cancelled',
        });
      }

      PaymentService.createInternalPayment({
        orderId: null,
        type: 'capture',
        amount: payment.transaction_amount || session.total,
        status: 'failed',
        externalId: payment.id?.toString() || '',
      }).catch((error) => {
        console.error(`Failed to create payment record for failed payment ${payment.id}: ${error.message}`);
      });

      console.log(`Payment ${payment.id} failed for session ${sessionId}, status updated to cancelled`);
    } catch (error: any) {
      console.error(`Error handling failed payment for session ${sessionId}:`, error.message);
      throw new AppError('Failed to handle payment failure', 500);
    }
  }

  private static async handleStockFailureRefund(sessionId: string, payment: any, session: any) {
    console.error(`Stock validation failed for session ${sessionId}`);

    try {
      await MercadoPagoService.refundPayment(payment.id?.toString() || '');

      await CheckoutSessionModel.findByIdAndUpdate(sessionId, {
        status: 'cancelled',
      });

      console.log(`Payment ${payment.id} refunded due to stock unavailability`);

      PaymentService.createInternalPayment({
        orderId: null,
        type: 'refund',
        amount: payment.transaction_amount || session.total,
        status: 'refunded',
        externalId: payment.id?.toString() || '',
      }).catch((refundError) => {
        console.error(`Failed to create refund record for payment ${payment.id}: ${refundError.message}`);
      });

      console.log(`Refund processed for payment ${payment.id} due to stock unavailability`);
    } catch (refundError: any) {
      console.error(`Failed to refund payment ${payment.id}:`, refundError.message);
      throw new AppError('Stock unavailable and refund failed', 500);
    }
  }

  private static async createOrderAndCompletePayment(sessionId: string, payment: any, session: any) {
    const paymentType = 'capture';

    const order = await OrderService.createOrder(
      session.userId.toString(),
      session.storeId.toString(),
      session.cartItems,
      session.total,
      session.shipping,
      paymentType,
      payment.id?.toString() || '',
    );

    PaymentService.createInternalPayment({
      orderId: order._id.toString(),
      type: paymentType,
      amount: payment.transaction_amount || session.total,
      status: 'success',
      externalId: payment.id?.toString() || '',
    }).catch((error) => {
      console.error(`Failed to create payment record for order ${order._id}: ${error.message}`);
    });

    await Promise.all(
      session.cartItems.map((item: { variantId: string; quantity: number }) =>
        VariantService.decreaseStock(item.variantId, item.quantity),
      ),
    );

    await CheckoutSessionModel.findByIdAndUpdate(sessionId, {
      status: 'completed',
    });

    console.log(`Order ${order._id} created successfully from webhook for session ${sessionId}`);
    return order;
  }
}
