import { Request, Response } from 'express';
import { MercadoPagoService } from '../services/mercadoPago.service';
import { catchAsync } from '../utils/catchAsync';

export class MercadoPagoController {
  static getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const paymentId = req.params.id;
    const paymentDetails = await MercadoPagoService.getPayment(paymentId);

    res.status(200).json({
      status: 'success',
      data: {
        payment: paymentDetails,
      },
    });
  });

  static handleWebhook = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const response = await MercadoPagoService.handleWebhook(payload);

    res.status(200).json({
      status: 'success',
      data: {
        response,
      },
    });
  });
}
