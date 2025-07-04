import { CheckoutSessionModel } from '../models/checkout.model';
import { CartItemService } from './cartItem.service';
import { AppError } from '../utils/appError';
import { UpdateCheckoutSessionDTO } from '../types/checkout.types';
import { calculateCityDistance } from '../utils/distance';
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

  static async createCheckoutSession(userId: string, userAddress: any) {
    if (!userAddress || !userAddress.location) {
      throw new AppError('User address is required for checkout', 400);
    }

    await this.cancelActiveCheckoutSessions(userId);

    const cartItems = await CartItemService.getCartItemsForCheckout(userId);

    const subtotal = cartItems.reduce((total, item: any) => {
      return total + item.variantId.price * item.quantity;
    }, 0);

    const shipping = await this.calculateShipping(userAddress, cartItems);

    const total = subtotal + shipping.cost;

    const cartItemsSnapshot = cartItems.map((item: any) => ({
      variantId: item.variantId._id,
      quantity: item.quantity,
      price: item.variantId.price,
    }));

    const checkoutSession = await CheckoutSessionModel.create({
      userId,
      cartItems: cartItemsSnapshot,
      subtotal,
      total,
      shipping,
      status: 'active',
    });

    return checkoutSession;
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

    if (data.paymentMethod) {
      session.paymentMethod = data.paymentMethod;
    }

    return session.save();
  }

  private static async cancelActiveCheckoutSessions(userId: string) {
    await CheckoutSessionModel.updateMany(
      { userId, status: 'active' },
      { status: 'cancelled' },
    );
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
      // Fallback to base costs if calculation fails
      return {
        cost: SHIPPING_CONFIG.pickupCost + SHIPPING_CONFIG.dropoffCost,
        type: 'simple',
        tryOnEnabled: false,
        distanceKm: 0,
      };
    }
  }
}
