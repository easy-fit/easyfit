import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { catchAsync } from '../utils/catchAsync';
import { CreateOrderDTO, UpdateOrderDTO } from '../types/order.types';

export class OrderController {
  static getOrders = catchAsync(async (_req: Request, res: Response) => {
    const orders = await OrderService.getOrders();
    res.status(200).json({ total: orders.length, orders });
  });

  static getOrderById = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    const order = await OrderService.getOrderById(orderId);
    res.status(200).json({ order });
  });

  static updateOrder = catchAsync(async (req: Request, res: Response) => {
    const data: UpdateOrderDTO = req.body;
    const orderId = req.params.id;
    const order = await OrderService.updateOrder(orderId, data);
    res.status(200).json({ order });
  });

  static deleteOrder = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.id;
    await OrderService.deleteOrder(orderId);
    res.status(204).json({ status: 'success' });
  });
}
