import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { catchAsync } from '../utils/catchAsync';
import { UpdateOrderDTO } from '../types/order.types';
import { TryPeriodManager } from '../services/tryPeriodManager.service';
import { ItemDecision } from '../types/tryPeriod.types';

export class OrderController {
  static getOrders = catchAsync(async (_req: Request, res: Response) => {
    const orders = await OrderService.getOrders();
    res.status(200).json({ total: orders.length, data: orders });
  });

  static getMyOrders = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const orders = await OrderService.getMyOrders(userId);
    res.status(200).json({ total: orders.length, data: orders });
  });

  static getOrderById = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const order = await OrderService.getOrderById(orderId);
    res.status(200).json({ data: order });
  });

  static updateOrder = catchAsync(async (req: Request, res: Response) => {
    const data: UpdateOrderDTO = req.body;
    const orderId = req.params.id;
    const order = await OrderService.updateOrder(orderId, data);
    res.status(200).json({ data: order });
  });

  static deleteOrder = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    await OrderService.deleteOrder(orderId);
    res.status(204).json({ status: 'success' });
  });

  static verifyDeliveryCode = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const { code, riderId } = req.body;

    const result = await OrderService.verifyDeliveryCode(orderId, code, riderId);

    if (result.success) {
      res.status(200).json({
        status: 'success',
        message: 'Delivery verified successfully',
        data: result.order,
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: result.message,
        attemptsRemaining: result.attemptsRemaining,
      });
    }
  });

  static saveDecisionsAndFinalize = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const { items }: { items: ItemDecision[] } = req.body;

    await TryPeriodManager.saveDecisionsAndFinalize(orderId, items);

    res.status(200).json({
      status: 'success',
      message: 'Decisions saved and try period finalized successfully',
    });
  });
}
