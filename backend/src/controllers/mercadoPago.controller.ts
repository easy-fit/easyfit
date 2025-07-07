import { Request, Response } from 'express';
import { PaymentWebhookService } from '../services/payment/paymentWebhook.service';
import { PaymentMercadoPagoService } from '../services/payment/paymentMercadoPago.service';
import { catchAsync } from '../utils/catchAsync';

export class MercadoPagoController {
  static getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const paymentId = req.params.id;
    const paymentDetails = await PaymentMercadoPagoService.getPayment(paymentId);

    res.status(200).json({
      status: 'success',
      data: {
        payment: paymentDetails,
      },
    });
  });

  static handleWebhook = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const response = await PaymentWebhookService.handleMercadoPagoWebhook(payload);

    res.status(200).json({
      status: 'success',
      data: {
        response,
      },
    });
  });
}
