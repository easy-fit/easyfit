import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AdminMonitoringService } from '../services/adminMonitoring.service';

export class AdminController {
  /**
   * Get overall system health status
   */
  static getSystemHealth = catchAsync(async (_req: Request, res: Response) => {
    const health = await AdminMonitoringService.getSystemHealth();

    res.status(200).json({
      status: 'success',
      data: health,
    });
  });

  /**
   * Get real-time system metrics
   */
  static getSystemMetrics = catchAsync(async (_req: Request, res: Response) => {
    const metrics = await AdminMonitoringService.getSystemMetrics();

    res.status(200).json({
      status: 'success',
      data: metrics,
    });
  });

  /**
   * Get orders that need admin attention
   */
  static getOrdersNeedingAttention = catchAsync(async (_req: Request, res: Response) => {
    const issues = await AdminMonitoringService.getOrdersNeedingAttention();

    res.status(200).json({
      status: 'success',
      data: issues,
    });
  });

  /**
   * Get active deliveries for monitoring
   */
  static getActiveDeliveries = catchAsync(async (_req: Request, res: Response) => {
    const deliveries = await AdminMonitoringService.getActiveDeliveries();

    res.status(200).json({
      status: 'success',
      data: deliveries,
    });
  });

  static retryFailedOperation = catchAsync(async (req: Request, res: Response) => {
    const { orderId, operation } = req.body;

    if (!orderId || !operation) {
      return res.status(400).json({
        status: 'error',
        message: 'Order ID and operation type are required',
      });
    }

    const result = await AdminMonitoringService.retryFailedOperation(orderId, operation);

    res.status(200).json({
      status: 'success',
      message: `Operation ${operation} retry initiated for order ${orderId}`,
      data: result,
    });
  });
}
