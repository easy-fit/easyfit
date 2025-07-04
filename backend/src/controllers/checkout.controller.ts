import { Request, Response } from 'express';
import { CheckoutService } from '../services/checkout.service';
import { catchAsync } from '../utils/catchAsync';
import { UpdateCheckoutSessionDTO } from '../types/checkout.types';

export class CheckoutController {
  static getCheckoutSessions = catchAsync(
    async (req: Request, res: Response) => {
      const checkoutSessions = await CheckoutService.getCheckoutSessions();

      res.status(200).json({
        status: 'success',
        data: {
          checkoutSessions,
        },
      });
    },
  );

  static getCheckoutSessionById = catchAsync(
    async (req: Request, res: Response) => {
      const sessionId = req.params.id;
      const checkoutSession = await CheckoutService.getCheckoutSessionById(sessionId);

      res.status(200).json({
        status: 'success',
        data: {
          checkoutSession,
        },
      });
    },
  );

  static createCheckoutSession = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user?._id;
      const userAddress = req.user?.address || {};

      const checkoutSession = await CheckoutService.createCheckoutSession(
        userId,
        userAddress,
      );

      res.status(201).json({
        status: 'success',
        data: {
          checkoutSession,
        },
      });
    },
  );

  static updateCheckoutSession = catchAsync(
    async (req: Request, res: Response) => {
      const sessionId = req.params.id;
      const data: UpdateCheckoutSessionDTO = req.body;

      const checkoutSession = await CheckoutService.updateCheckoutSession(
        sessionId,
        data,
      );

      res.status(200).json({
        status: 'success',
        data: {
          checkoutSession,
        },
      });
    },
  );
}
