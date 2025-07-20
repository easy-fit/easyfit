import { Request, Response } from 'express';
import { CheckoutService } from '../services/checkout/checkout.service';
import { catchAsync } from '../utils/catchAsync';
import { UpdateCheckoutSessionDTO } from '../types/checkout.types';
import { PaymentProcessingRequest } from '../types/mercadoPago.types';

export class CheckoutController {
  static getCheckoutSessions = catchAsync(async (req: Request, res: Response) => {
    const checkoutSessions = await CheckoutService.getCheckoutSessions();

    res.status(200).json({
      status: 'success',
      data: {
        checkoutSessions,
      },
    });
  });

  static getCheckoutSessionById = catchAsync(async (req: Request, res: Response) => {
    const sessionId = req.params.id;
    const checkoutSession = await CheckoutService.getCheckoutSessionById(sessionId);

    res.status(200).json({
      status: 'success',
      data: {
        checkoutSession,
      },
    });
  });

  static createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const userAddress = req.user?.address || {};
    const shippingType = req.body.shippingType || 'simple';

    const { checkoutSession, preferenceId } = await CheckoutService.createCheckoutSession(
      user,
      userAddress,
      shippingType,
    );

    res.status(201).json({
      status: 'success',
      data: {
        checkoutSession,
        preferenceId,
      },
    });
  });

  static updateCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    const sessionId = req.params.id;
    const data: UpdateCheckoutSessionDTO = req.body;

    const checkoutSession = await CheckoutService.updateCheckoutSession(sessionId, data);

    res.status(200).json({
      status: 'success',
      data: {
        checkoutSession,
      },
    });
  });

  static processPayment = catchAsync(async (req: Request, res: Response) => {
    const sessionId = req.params.id;
    const paymentData: PaymentProcessingRequest = req.body;
    const user = req.user;

    const result = await CheckoutService.processPayment(sessionId, paymentData, user);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });
}
