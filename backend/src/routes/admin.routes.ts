import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { protect, restrictTo } from '../middlewares/auth';

export const adminRoutes = Router();

// All admin routes require authentication and admin role
adminRoutes.use(protect);
adminRoutes.use(restrictTo('admin'));

// System monitoring endpoints
adminRoutes.get('/health', AdminController.getSystemHealth);
adminRoutes.get('/metrics', AdminController.getSystemMetrics);
adminRoutes.get('/issues', AdminController.getOrdersNeedingAttention);
adminRoutes.get('/deliveries/active', AdminController.getActiveDeliveries);

// Manual intervention endpoints
adminRoutes.post('/retry-operation', AdminController.retryFailedOperation);

// Manual order management endpoints
adminRoutes.get('/orders/:orderId/management-details', AdminController.getOrderManagementDetails);
adminRoutes.get('/orders/:orderId/available-riders', AdminController.getAvailableRiders);
adminRoutes.post('/orders/:orderId/assign-rider', AdminController.manuallyAssignRider);
adminRoutes.patch('/orders/:orderId/force-status', AdminController.forceStatusTransition);