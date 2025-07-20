import { PaymentModel } from '../../models/payment.model';
import { AppError } from '../../utils/appError';

export class PaymentService {
  static async getInternalPayments() {
    return PaymentModel.find();
  }

  static async getInternalPaymentById(paymentId: string) {
    const payment = await PaymentModel.findById(paymentId);
    this.ensurePaymentExists(payment);
    return payment;
  }

  static async getInternalPaymentByOrderId(orderId: string) {
    const payment = await PaymentModel.findOne({ orderId });
    this.ensurePaymentExists(payment);
    return payment;
  }

  static async createInternalPayment(data: any) {
    return PaymentModel.create(data);
  }

  static async updateInternalPayment(paymentId: string, data: any) {
    const payment = await PaymentModel.findByIdAndUpdate(paymentId, data, {
      new: true,
    });
    this.ensurePaymentExists(payment);

    return payment;
  }

  static async deleteInternalPayment(paymentId: string) {
    const payment = await PaymentModel.findByIdAndDelete(paymentId);
    this.ensurePaymentExists(payment);
  }

  static async getInternalPaymentByExternalId(externalId: string) {
    return PaymentModel.findOne({ externalId });
  }

  private static ensurePaymentExists(payment: any): void {
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }
  }
}
