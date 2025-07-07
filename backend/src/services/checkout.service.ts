import { CheckoutSessionModel } from '../models/checkout.model';
import { CartItemService } from './cartItem.service';
import { AppError } from '../utils/appError';
import { UpdateCheckoutSessionDTO } from '../types/checkout.types';
import { User } from '../types/user.types';
import { calculateCityDistance } from '../utils/distance';
import { MercadoPagoService } from './mercadoPago.service';
import { VariantService } from './variant/variant.service';
import { PaymentService } from './payment.service';
import { OrderService } from './order.service';
import { PaymentProcessingRequest } from '../types/mercadoPago.types';
import { SHIPPING_CONFIG, SHIPPING_BASE_COSTS } from '../config/shipping';
import { StoreService } from './store/store.service';

export class CheckoutService {
  static async getCheckoutSessions() {
    const sessions = await CheckoutSessionModel.find();

    return sessions;
  }

  static async getCheckoutSessionById(sessionId: string) {
    const session = await CheckoutSessionModel.findById(sessionId);

    if (!session) {
      throw new AppError('Checkout session not found', 404);
    }

    return session;
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

    const shipping = await this.calculateShipping(userAddress, cartItems);

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
    const session = await this.getCheckoutSessionById(sessionId);
    if (session.status !== 'active') {
      throw new AppError('Cannot process payment for inactive session', 400);
    }
    try {
      for (const item of session.cartItems) {
        await VariantService.checkStockAvailable(item.variantId, item.quantity);
      }

      const mercadoPagoResponse = await MercadoPagoService.processPayment(
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

  static async completePaymentFromWebhook(sessionId: string, payment: any) {
    const session = await this.getCheckoutSessionById(sessionId);

    if (session.status !== 'active') {
      throw new AppError(
        `Cannot complete payment for session with status: ${session.status}`,
        400,
      );
    }

    const isStockAvailable = await this.validateStockAvailability(
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
      const session = await this.getCheckoutSessionById(sessionId);

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

  private static async cancelActiveCheckoutSessions(userId: string) {
    await CheckoutSessionModel.updateMany(
      { userId, status: 'active' },
      { status: 'cancelled' },
    );
  }

  private static async validateStockAvailability(
    cartItems: any[],
  ): Promise<boolean> {
    try {
      for (const item of cartItems) {
        await VariantService.checkStockAvailable(item.variantId, item.quantity);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  private static async handleStockFailureRefund(
    sessionId: string,
    payment: any,
    session: any,
  ) {
    console.error(`Stock validation failed for session ${sessionId}`);

    try {
      await MercadoPagoService.refundPayment(payment.id?.toString() || '');

      await CheckoutSessionModel.findByIdAndUpdate(sessionId, {
        status: 'cancelled',
      });

      console.log(`Payment ${payment.id} refunded due to stock unavailability`);

      // TODO: Notify user of stock issue and refund
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

  private static async calculateShipping(userAddress: any, cartItems: any[]) {
    try {
      const storeId = cartItems[0]?.variantId?.productId?.storeId;

      const storeLocation = await StoreService.getStoreLocationById(storeId);

      if (!storeLocation || !userAddress.location) {
        return {
          cost: SHIPPING_CONFIG.pickupCost + SHIPPING_CONFIG.dropoffCost,
          type: 'simple',
          tryOnEnabled: false,
          distanceKm: 0,
        };
      }

      const distanceResult = await calculateCityDistance(
        {
          latitude: storeLocation[1],
          longitude: storeLocation[0],
        },
        {
          latitude: userAddress.location.coordinates[1],
          longitude: userAddress.location.coordinates[0],
        },
      );

      const shippingCost =
        SHIPPING_CONFIG.pickupCost +
        SHIPPING_CONFIG.dropoffCost +
        distanceResult.distance * SHIPPING_CONFIG.costPerKm;

      return {
        cost: Math.round(shippingCost),
        type: 'simple',
        tryOnEnabled: false,
        distanceKm: distanceResult.distance,
        durationMinutes: distanceResult.duration,
      };
    } catch (error) {
      return {
        cost: SHIPPING_CONFIG.pickupCost + SHIPPING_CONFIG.dropoffCost,
        type: 'simple',
        tryOnEnabled: false,
        distanceKm: 0,
      };
    }
  }
}
