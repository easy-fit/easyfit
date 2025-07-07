import { CheckoutSessionModel } from '../../models/checkout.model';
import { AppError } from '../../utils/appError';
import { User } from '../../types/user.types';
import { PaymentProcessingRequest } from '../../types/mercadoPago.types';
import { VariantService } from '../variant/variant.service';
import { PaymentService } from '../payment/payment.service';
import { OrderService } from '../order.service';
import { PaymentMercadoPagoService } from '../payment/paymentMercadoPago.service';
import { CheckoutSessionService } from './checkoutSession.service';

export class CheckoutPaymentService {
  static async processPayment(
    sessionId: string,
    paymentData: PaymentProcessingRequest,
    user: User,
  ) {
    const session = await CheckoutSessionService.getCheckoutSessionById(sessionId);
    if (session.status !== 'active') {
      throw new AppError('Cannot process payment for inactive session', 400);
    }
    try {
      for (const item of session.cartItems) {
        await VariantService.checkStockAvailable(item.variantId, item.quantity);
      }

      const mercadoPagoResponse = await PaymentMercadoPagoService.processPayment(
        paymentData,
        sessionId,
        session.cartItems,
        user,
      );

      const paymentType =
        paymentData.payment_type_id === 'credit_card' ? 'hold' : 'capture';

      if (
        mercadoPagoResponse.status === 'approved' ||
        mercadoPagoResponse.status === 'authorized'
      ) {
        const order = await OrderService.createOrder(
          session.userId.toString(),
          session.id.toString(),
          session.cartItems,
          session.total,
          session.shipping,
          paymentType,
          mercadoPagoResponse.id?.toString() || '',
        );

        await Promise.all(
          session.cartItems.map((item) =>
            VariantService.decreaseStock(item.variantId, item.quantity),
          ),
        );

        await CheckoutSessionModel.findByIdAndUpdate(sessionId, {
          status: 'completed',
        });

        PaymentService.createPayment({
          userId: session.userId.toString(),
          orderId: order._id.toString(),
          paymentId: mercadoPagoResponse.id?.toString() || '',
          amount: session.total,
          paymentType,
          status: mercadoPagoResponse.status,
        }).catch((error) => {
          console.error(
            `Failed to create payment record for order ${order._id}: ${error.message}`,
          );
        });

        return {
          order,
          payment: mercadoPagoResponse,
          paymentType,
          message: 'Payment processed successfully',
        };
      } else {
        throw new AppError(
          `Payment failed: ${mercadoPagoResponse.status}: ${mercadoPagoResponse.status_detail}`,
          400,
        );
      }
    } catch (error: any) {
      throw new AppError(
        `Payment processing failed: ${error.message}`,
        error.statusCode || 500,
      );
    }
  }

  static async validateStockAvailability(cartItems: any[]): Promise<boolean> {
    try {
      for (const item of cartItems) {
        await VariantService.checkStockAvailable(item.variantId, item.quantity);
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}