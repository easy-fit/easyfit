import { CheckoutSessionModel } from '../../models/checkout.model';
import { AppError } from '../../utils/appError';
import { UpdateCheckoutSessionDTO } from '../../types/checkout.types';
import { SHIPPING_BASE_COSTS } from '../../config/shipping';

export class CheckoutSessionService {
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

  static async cancelActiveCheckoutSessions(userId: string) {
    await CheckoutSessionModel.updateMany(
      { userId, status: 'active' },
      { status: 'cancelled' },
    );
  }
}