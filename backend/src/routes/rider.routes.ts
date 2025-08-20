import { Router } from 'express';
import { protect } from '../middlewares/auth';
import {
  getWeeklySummary,
  getRecentActivity,
  getDashboardStats,
  getAvailabilityStatus,
  getActiveAssignments,
} from '../controllers/rider.controller';

export const riderRoutes = Router();

// All rider routes require authentication
riderRoutes.use(protect);

// Dashboard routes
riderRoutes.get('/dashboard/weekly-summary', getWeeklySummary);
riderRoutes.get('/dashboard/recent-activity', getRecentActivity);
riderRoutes.get('/dashboard/stats', getDashboardStats);

// Availability and assignments routes
riderRoutes.get('/availability', getAvailabilityStatus);
riderRoutes.get('/assignments/active', getActiveAssignments);
