import { Request, Response } from 'express';
import { PaymentService } from '../services/payment/payment.service';
import { catchAsync } from '../utils/catchAsync';

export class PaymentController {
  static getInternalPayments = catchAsync(async (req: Request, res: Response) => {
    const payments = await PaymentService.getInternalPayments();
    res.status(200).json({ total: payments.length, data: payments });
  });

  static getInternalPaymentById = catchAsync(async (req: Request, res: Response) => {
    const paymentId = req.params.id;
    const payment = await PaymentService.getInternalPaymentById(paymentId);
    res.status(200).json({ data: payment });
  });

  static getInternalPaymentByExternalId = catchAsync(async (req: Request, res: Response) => {
    const externalId = req.params.externalId;
    const payment = await PaymentService.getInternalPaymentByExternalId(externalId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json({ data: payment });
  });

  static createInternalPayment = catchAsync(async (req: Request, res: Response) => {
    const paymentData = req.body;
    const payment = await PaymentService.createInternalPayment(paymentData);
    res.status(201).json({ data: payment });
  });

  static updateInternalPayment = catchAsync(async (req: Request, res: Response) => {
    const paymentId = req.params.id;
    const paymentData = req.body;
    const updatedPayment = await PaymentService.updateInternalPayment(paymentId, paymentData);
    res.status(200).json({ data: updatedPayment });
  });

  static deleteInternalPayment = catchAsync(async (req: Request, res: Response) => {
    const paymentId = req.params.id;
    await PaymentService.deleteInternalPayment(paymentId);
    res.status(204).send();
  });

  // Note: MercadoPago operations moved to MercadoPagoService
  // These endpoints should be updated to use MercadoPagoService directly
  // or moved to MercadoPagoController if needed
}
