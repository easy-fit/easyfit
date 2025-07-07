import { PaymentModel } from '../models/payment.model';
import { AppError } from '../utils/appError';

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

  private static ensurePaymentExists(payment: any): void {
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }
  }
}
