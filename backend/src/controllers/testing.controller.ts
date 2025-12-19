import { Request, Response } from 'express';
import { TestingService } from '../services/testing.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';

export class TestingController {
  /**
   * Create a test order bypassing payment processing
   * POST /api/v1/test/create-order
   */
  static createTestOrder = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const { shippingType = 'simple' } = req.body;

    if (!user) {
      throw new AppError('User not authenticated', 401);
    }

    if (!user.address) {
      throw new AppError('User must have an address to create test orders', 400);
    }

    const result = await TestingService.createTestOrder(user, user.address, shippingType);

    res.status(201).json({
      status: 'success',
      message: 'Test order created successfully',
      data: result
    });
  });

  /**
   * Simulate store response (accept/reject order)
   * POST /api/v1/test/store-response
   */
  static simulateStoreResponse = catchAsync(async (req: Request, res: Response) => {
    const { orderId, storeId, accepted, reason } = req.body;

    if (!orderId || !storeId || typeof accepted !== 'boolean') {
      throw new AppError('orderId, storeId, and accepted (boolean) are required', 400);
    }

    const result = await TestingService.simulateStoreResponse(orderId, storeId, accepted, reason);

    res.status(200).json({
      status: 'success',
      message: `Order ${accepted ? 'accepted' : 'rejected'} successfully`,
      data: result
    });
  });

  /**
   * Get test order details
   * GET /api/v1/test/orders/:orderId
   */
  static getTestOrder = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await TestingService.getTestOrderById(orderId);

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  });

  /**
   * Get testing environment info
   * GET /api/v1/test/info
   */
  static getTestingInfo = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    res.status(200).json({
      status: 'success',
      data: {
        environment: 'testing',
        user: user ? {
          id: user._id,
          name: user.name,
          email: user.email,
          hasAddress: !!user.address
        } : null,
        message: 'Testing environment is active. Payment processing is bypassed.'
      }
    });
  });
}