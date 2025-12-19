import { Router } from 'express';
import { TestingController } from '../controllers/testing.controller';
import { protect } from '../middlewares/auth';

const router = Router();

// Environment check middleware - only enable in testing/staging
const testingEnvironmentCheck = (req: any, res: any, next: any) => {
  const allowedEnvironments = ['development', 'staging', 'test'];
  const currentEnv = process.env.NODE_ENV || 'development';

  if (!allowedEnvironments.includes(currentEnv)) {
    return res.status(403).json({
      status: 'error',
      message: 'Testing routes are only available in development, staging, or test environments',
    });
  }

  next();
};

// Apply environment check to all testing routes
router.use(testingEnvironmentCheck);

// Testing info (public)
router.get('/info', TestingController.getTestingInfo);

// Authenticated testing routes
router.use(protect);

// Create test order (bypasses payment)
router.post('/create-order', TestingController.createTestOrder);

// Simulate store response
router.post('/store-response', TestingController.simulateStoreResponse);

// Get test order details
router.get('/orders/:orderId', TestingController.getTestOrder);

export default router;
