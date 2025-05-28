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
    const order = await OrderService.getOrderById(req.params.id);
    res.status(200).json({ order });
  });

  static createOrder = catchAsync(async (req: Request, res: Response) => {
    const dto: CreateOrderDTO = req.body;
    const order = await OrderService.createOrder(dto);
    res.status(201).json({ order });
  });

  static updateOrder = catchAsync(async (req: Request, res: Response) => {
    const dto: UpdateOrderDTO = req.body;
    const order = await OrderService.updateOrder(req.params.id, dto);
    res.status(200).json({ order });
  });

  static deleteOrder = catchAsync(async (req: Request, res: Response) => {
    await OrderService.deleteOrder(req.params.id);
    res.status(204).json({ status: 'success' });
  });
}
