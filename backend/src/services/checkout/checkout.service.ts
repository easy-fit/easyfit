import { CheckoutSessionModel } from '../../models/checkout.model';
import { CartItemService } from '../cartItem.service';
import { AppError } from '../../utils/appError';
import { UpdateCheckoutSessionDTO } from '../../types/checkout.types';
import { User } from '../../types/user.types';
import { PaymentProcessingRequest } from '../../types/mercadoPago.types';
import { MercadoPagoService } from '../payment/mercadoPago.service';
import { CheckoutShippingService } from './checkoutShipping.service';
import { CheckoutPaymentService } from './checkoutPayment.service';
import { CheckoutWebhookService } from './checkoutWebhook.service';
import { SHIPPING_BASE_COSTS } from '../../config/shipping';

export class CheckoutService {
  static async getCheckoutSessions() {
    return CheckoutSessionModel.find();
  }

  static async getCheckoutSessionById(sessionId: string) {
    const session = await CheckoutSessionModel.findById(sessionId);
    if (!session) {
      throw new AppError('Checkout session not found', 404);
    }
    return session;
  }

  static async updateCheckoutSession(
    sessionId: string,
    data: UpdateCheckoutSessionDTO,
  ) {
    const session = await CheckoutSessionModel.findById(sessionId);

    if (!session) {
      throw new AppError('Checkout session not found', 404);
    }

    if (session.status !== 'active') {
      throw new AppError('Cannot update inactive checkout session', 400);
    }

    if (data.deliveryType) {
      const currentDeliveryTypeCost =
        SHIPPING_BASE_COSTS[session.shipping.type];
      const newDeliveryTypeCost = SHIPPING_BASE_COSTS[data.deliveryType];

      session.shipping.type = data.deliveryType;
      session.shipping.tryOnEnabled =
        data.deliveryType === 'premium' || data.deliveryType === 'advanced';
      session.shipping.cost =
        session.shipping.cost - currentDeliveryTypeCost + newDeliveryTypeCost;
      session.total = session.subtotal + session.shipping.cost;
    }

    return session.save();
  }

  static async createCheckoutSession(user: User, userAddress: any) {
    if (!userAddress || !userAddress.location) {
      throw new AppError('User address is required for checkout', 400);
    }

    await this.cancelActiveCheckoutSessions(user._id);

    const cartItems = await CartItemService.getCartItemsForCheckout(user._id);

    const subtotal = cartItems.reduce((total, item: any) => {
      return total + item.variantId.price * item.quantity;
    }, 0);

    const shipping = await CheckoutShippingService.calculateShipping(
      userAddress,
      cartItems,
    );

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

    const preferenceId = await MercadoPagoService.createPreference(
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
    return CheckoutPaymentService.createMercadoPagoPayment(
      sessionId,
      paymentData,
      user,
    );
  }

  static async completePaymentFromWebhook(sessionId: string, payment: any) {
    return CheckoutWebhookService.completePaymentFromWebhook(
      sessionId,
      payment,
    );
  }

  static async handleFailedPayment(sessionId: string, payment: any) {
    return CheckoutWebhookService.handleFailedPayment(sessionId, payment);
  }

  private static async cancelActiveCheckoutSessions(userId: string) {
    await CheckoutSessionModel.updateMany(
      { userId, status: 'active' },
      { status: 'cancelled' },
    );
  }
}
