import express, { Application, NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { AppError } from './utils/appError';
import { globalErrorHandler } from './controllers/error.controller';
import apiRoutes from './routes';
import webhooks from './routes/webhooks/index';
import cors from 'cors';

export const app: Application = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // Allow cookies to be sent
  }),
);

app.use('/webhooks', webhooks);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1', apiRoutes);

// Health check endpoint for Docker/ECS
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
