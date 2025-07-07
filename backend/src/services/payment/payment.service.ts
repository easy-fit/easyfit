import { PaymentModel } from '../../models/payment.model';
import { AppError } from '../../utils/appError';
import { PaymentMercadoPagoService } from './paymentMercadoPago.service';
import { PaymentWebhookService } from './paymentWebhook.service';

export class PaymentService {
  static async getPayments() {
    return PaymentModel.find();
  }

  static async getPaymentById(paymentId: string) {
    const payment = await PaymentModel.findById(paymentId);
    this.ensurePaymentExists(payment);
    return payment;
  }

  static async createPayment(data: any) {
    return PaymentModel.create(data);
  }

  static async updatePayment(paymentId: string, data: any) {
    const payment = await PaymentModel.findByIdAndUpdate(paymentId, data, {
      new: true,
    });
    this.ensurePaymentExists(payment);

    return payment;
  }

  static async deletePayment(paymentId: string) {
    const payment = await PaymentModel.findByIdAndDelete(paymentId);
    this.ensurePaymentExists(payment);
  }

  static async getPaymentByExternalId(externalId: string) {
    return PaymentModel.findOne({ externalId });
  }

  // MercadoPago delegations
  static async createMercadoPagoPayment(paymentData: any) {
    return PaymentMercadoPagoService.createPayment(paymentData);
  }

  static async processMercadoPagoPayment(
    paymentData: any,
    sessionId: string,
    cartItems: any[],
    userInfo?: any,
  ) {
    return PaymentMercadoPagoService.processPayment(
      paymentData,
      sessionId,
      cartItems,
      userInfo,
    );
  }

  static async getMercadoPagoPayment(paymentId: string) {
    return PaymentMercadoPagoService.getPayment(paymentId);
  }

  static async captureMercadoPagoPayment(paymentId: string, amount?: number) {
    return PaymentMercadoPagoService.capturePayment(paymentId, amount);
  }

  static async cancelMercadoPagoPayment(paymentId: string) {
    return PaymentMercadoPagoService.cancelPayment(paymentId);
  }

  static async refundMercadoPagoPayment(paymentId: string, amount?: number) {
    return PaymentMercadoPagoService.refundPayment(paymentId, amount);
  }

  static async createMercadoPagoPreference(
    user: any,
    data: any,
    sessionId: string,
    cost: number,
  ) {
    return PaymentMercadoPagoService.createPreference(user, data, sessionId, cost);
  }

  // Webhook delegations
  static async handleMercadoPagoWebhook(payload: any) {
    return PaymentWebhookService.handleMercadoPagoWebhook(payload);
  }

  private static ensurePaymentExists(payment: any): void {
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }
  }
}