import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { getWeeklySummary, getRecentActivity, getDashboardStats } from '../controllers/rider.controller';

const router = Router();

// All rider routes require authentication
router.use(protect);

// Dashboard routes
router.get('/dashboard/weekly-summary', getWeeklySummary);
router.get('/dashboard/recent-activity', getRecentActivity);
router.get('/dashboard/stats', getDashboardStats);

export { router as riderRoutes };