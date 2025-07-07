import { CheckoutSessionModel } from '../../models/checkout.model';
import { AppError } from '../../utils/appError';
import { PaymentService } from '../payment/payment.service';
import { OrderService } from '../order.service';
import { PaymentMercadoPagoService } from '../payment/paymentMercadoPago.service';
import { VariantService } from '../variant/variant.service';
import { CheckoutSessionService } from './checkoutSession.service';
import { CheckoutPaymentService } from './checkoutPayment.service';

export class CheckoutWebhookService {
  static async completePaymentFromWebhook(sessionId: string, payment: any) {
    const session = await CheckoutSessionService.getCheckoutSessionById(sessionId);

    if (session.status !== 'active') {
      throw new AppError(
        `Cannot complete payment for session with status: ${session.status}`,
        400,
      );
    }

    const isStockAvailable = await CheckoutPaymentService.validateStockAvailability(
      session.cartItems,
    );
    if (!isStockAvailable) {
      await this.handleStockFailureRefund(sessionId, payment, session);
      throw new AppError('Stock unavailable, payment refunded', 400);
    }

    return await this.createOrderAndCompletePayment(
      sessionId,
      payment,
      session,
    );
  }

  static async handleFailedPayment(sessionId: string, payment: any) {
    try {
      const session = await CheckoutSessionService.getCheckoutSessionById(sessionId);

      if (session.status === 'active') {
        await CheckoutSessionModel.findByIdAndUpdate(sessionId, {
          status: 'cancelled',
        });
      }

      await PaymentService.createPayment({
        orderId: null,
        type: 'capture',
        amount: payment.transaction_amount || session.total,
        status: 'failed',
        externalId: payment.id?.toString() || '',
      });

      console.log(
        `Payment ${payment.id} failed for session ${sessionId}, status updated to cancelled`,
      );
    } catch (error: any) {
      console.error(
        `Error handling failed payment for session ${sessionId}:`,
        error.message,
      );
      throw new AppError('Failed to handle payment failure', 500);
    }
  }

  private static async handleStockFailureRefund(
    sessionId: string,
    payment: any,
    session: any,
  ) {
    console.error(`Stock validation failed for session ${sessionId}`);

    try {
      await PaymentMercadoPagoService.refundPayment(payment.id?.toString() || '');

      await CheckoutSessionModel.findByIdAndUpdate(sessionId, {
        status: 'cancelled',
      });

      console.log(`Payment ${payment.id} refunded due to stock unavailability`);

      PaymentService.createPayment({
        orderId: null,
        type: 'refund',
        amount: payment.transaction_amount || session.total,
        status: 'refunded',
        externalId: payment.id?.toString() || '',
      });

      console.log(
        `Refund processed for payment ${payment.id} due to stock unavailability`,
      );
    } catch (refundError: any) {
      console.error(
        `Failed to refund payment ${payment.id}:`,
        refundError.message,
      );
      throw new AppError('Stock unavailable and refund failed', 500);
    }
  }

  private static async createOrderAndCompletePayment(
    sessionId: string,
    payment: any,
    session: any,
  ) {
    const paymentType = 'capture';

    const order = await OrderService.createOrder(
      session.userId.toString(),
      session.id.toString(),
      session.cartItems,
      session.total,
      session.shipping,
      paymentType,
      payment.id?.toString() || '',
    );

    PaymentService.createPayment({
      orderId: order._id.toString(),
      type: paymentType,
      amount: payment.transaction_amount || session.total,
      status: 'success',
      externalId: payment.id?.toString() || '',
    }).catch((error) => {
      console.error(
        `Failed to create payment record for order ${order._id}: ${error.message}`,
      );
    });

    await Promise.all(
      session.cartItems.map((item: { variantId: string; quantity: number }) =>
        VariantService.decreaseStock(item.variantId, item.quantity),
      ),
    );

    await CheckoutSessionModel.findByIdAndUpdate(sessionId, {
      status: 'completed',
    });

    console.log(
      `Order ${order._id} created successfully from webhook for session ${sessionId}`,
    );
    return order;
  }
}