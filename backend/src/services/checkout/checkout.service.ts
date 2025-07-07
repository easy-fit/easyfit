import { CheckoutSessionModel } from '../../models/checkout.model';
import { CartItemService } from '../cartItem.service';
import { AppError } from '../../utils/appError';
import { UpdateCheckoutSessionDTO } from '../../types/checkout.types';
import { User } from '../../types/user.types';
import { PaymentProcessingRequest } from '../../types/mercadoPago.types';
import { PaymentMercadoPagoService } from '../payment/paymentMercadoPago.service';
import { CheckoutSessionService } from './checkoutSession.service';
import { CheckoutShippingService } from './checkoutShipping.service';
import { CheckoutPaymentService } from './checkoutPayment.service';
import { CheckoutWebhookService } from './checkoutWebhook.service';

export class CheckoutService {
  static async getCheckoutSessions() {
    return CheckoutSessionService.getCheckoutSessions();
  }

  static async getCheckoutSessionById(sessionId: string) {
    return CheckoutSessionService.getCheckoutSessionById(sessionId);
  }

  static async createCheckoutSession(user: User, userAddress: any) {
    if (!userAddress || !userAddress.location) {
      throw new AppError('User address is required for checkout', 400);
    }

    await CheckoutSessionService.cancelActiveCheckoutSessions(user._id);

    const cartItems = await CartItemService.getCartItemsForCheckout(user._id);

    const subtotal = cartItems.reduce((total, item: any) => {
      return total + item.variantId.price * item.quantity;
    }, 0);

    const shipping = await CheckoutShippingService.calculateShipping(userAddress, cartItems);

    const total = subtotal + shipping.cost;

    const cartItemsSnapshot = cartItems.map((item: any) => ({
      variantId: item.variantId._id.toString(),
      title: item.variantId.productId.title,
      quantity: item.quantity,
      unit_price: item.variantId.price,
    }));

    const checkoutSession = await CheckoutSessionModel.create({
      userId: user._id,
      cartItems: cartItemsSnapshot,
      subtotal,
      total,
      shipping,
      status: 'active',
    });

    const preferenceId = await PaymentMercadoPagoService.createPreference(
      user,
      cartItemsSnapshot,
      checkoutSession._id.toString(),
      shipping.cost,
    );

    return { checkoutSession, preferenceId };
  }

  static async processPayment(
    sessionId: string,
    paymentData: PaymentProcessingRequest,
    user: User,
  ) {
    return CheckoutPaymentService.processPayment(sessionId, paymentData, user);
  }

  static async completePaymentFromWebhook(sessionId: string, payment: any) {
    return CheckoutWebhookService.completePaymentFromWebhook(sessionId, payment);
  }

  static async handleFailedPayment(sessionId: string, payment: any) {
    return CheckoutWebhookService.handleFailedPayment(sessionId, payment);
  }

  static async updateCheckoutSession(
    sessionId: string,
    data: UpdateCheckoutSessionDTO,
  ) {
    return CheckoutSessionService.updateCheckoutSession(sessionId, data);
  }
}