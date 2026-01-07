import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AdminMonitoringService } from '../services/adminMonitoring.service';
import { AdminOrderService } from '../services/adminOrder.service';
import { StoreFinanceService } from '../services/storeFinance.service';

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

  /**
   * Get available riders for manual assignment
   */
  static getAvailableRiders = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const riders = await AdminOrderService.getAvailableRidersForOrder(orderId);

    res.status(200).json({
      status: 'success',
      data: {
        riders,
      },
    });
  });

  /**
   * Manually assign a rider to an order
   * Optionally accepts a rider code to immediately verify delivery
   */
  static manuallyAssignRider = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { riderId, riderCode } = req.body;

    if (!riderId) {
      return res.status(400).json({
        status: 'error',
        message: 'Rider ID is required',
      });
    }

    const result = await AdminOrderService.manuallyAssignRider(orderId, riderId, riderCode);

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: result,
    });
  });

  /**
   * Force a status transition (admin override)
   */
  static forceStatusTransition = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'Target status is required',
      });
    }

    const result = await AdminOrderService.forceStatusTransition(orderId, status, reason);

    res.status(200).json({
      status: 'success',
      message: result.message,
      data: result,
    });
  });

  /**
   * Get order details for manual management
   */
  static getOrderManagementDetails = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const details = await AdminOrderService.getOrderDetailsForManagement(orderId);

    res.status(200).json({
      status: 'success',
      data: details,
    });
  });

  /**
   * Get balances for all stores
   */
  static getStoreBalances = catchAsync(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = req.query;

    const options = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    const balances = await StoreFinanceService.getAllStoreBalances(options);

    res.status(200).json({
      status: 'success',
      data: balances,
    });
  });

  /**
   * Get balance details for a single store
   */
  static getStoreBalanceById = catchAsync(async (req: Request, res: Response) => {
    const { storeId } = req.params;

    const balance = await StoreFinanceService.getStoreBalance(storeId);

    res.status(200).json({
      status: 'success',
      data: balance,
    });
  });

  /**
   * Get detailed order breakdown for a store
   */
  static getStoreOrderFinancials = catchAsync(async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const { page, limit, startDate, endDate, status } = req.query;

    const options = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      status: status as any,
    };

    const details = await StoreFinanceService.getStoreOrderDetails(storeId, options);

    res.status(200).json({
      status: 'success',
      data: details,
    });
  });
}
