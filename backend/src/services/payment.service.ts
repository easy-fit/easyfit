import { PaymentModel } from '../models/payment.model';
import { AppError } from '../utils/appError';
import { CreatePaymentDTO, UpdatePaymentDTO } from '../types/payment.types';

export class PaymentService {
  static async getPayments() {
    return PaymentModel.find();
  }

  static async getPaymentById(paymentId: string) {
    const payment = await PaymentModel.findById(paymentId);
    this.ensurePaymentExists(payment);
    return payment;
  }

  static async createPayment(data: CreatePaymentDTO) {
    return PaymentModel.create(data);
  }

  static async updatePayment(paymentId: string, updates: UpdatePaymentDTO) {
    const payment = await PaymentModel.findByIdAndUpdate(paymentId, updates, {
      new: true,
    });
    this.ensurePaymentExists(payment);

    return payment;
  }

  static async deletePayment(paymentId: string) {
    const payment = await PaymentModel.findByIdAndDelete(paymentId);
    this.ensurePaymentExists(payment);
  }

  private static ensurePaymentExists(payment: any): void {
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }
  }
}
