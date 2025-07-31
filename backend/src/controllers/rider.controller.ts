import { Request, Response } from 'express';
import { RiderService } from '../services/rider.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';

export const getWeeklySummary = catchAsync(async (req: Request, res: Response) => {
  const riderId = req.user?._id;
  
  if (!riderId) {
    throw new AppError('Usuario no autenticado', 401);
  }

  if (req.user?.role !== 'rider') {
    throw new AppError('Acceso denegado. Solo riders pueden acceder a esta información.', 403);
  }

  const weeklySummary = await RiderService.getWeeklySummary(riderId);

  res.status(200).json({
    status: 'success',
    data: { weeklySummary }
  });
});

export const getRecentActivity = catchAsync(async (req: Request, res: Response) => {
  const riderId = req.user?._id;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (!riderId) {
    throw new AppError('Usuario no autenticado', 401);
  }

  if (req.user?.role !== 'rider') {
    throw new AppError('Acceso denegado. Solo riders pueden acceder a esta información.', 403);
  }

  if (limit > 50) {
    throw new AppError('El límite máximo de actividades es 50', 400);
  }

  const recentActivity = await RiderService.getRecentActivity(riderId, limit);

  res.status(200).json({
    status: 'success',
    data: { recentActivity }
  });
});

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const riderId = req.user?._id;
  
  if (!riderId) {
    throw new AppError('Usuario no autenticado', 401);
  }

  if (req.user?.role !== 'rider') {
    throw new AppError('Acceso denegado. Solo riders pueden acceder a esta información.', 403);
  }

  const [weeklySummary, recentActivity] = await Promise.all([
    RiderService.getWeeklySummary(riderId),
    RiderService.getRecentActivity(riderId, 10)
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      weeklySummary,
      recentActivity
    }
  });
});