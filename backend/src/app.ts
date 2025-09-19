import express, { Application, NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { AppError } from './utils/appError';
import { globalErrorHandler } from './controllers/error.controller';
import apiRoutes from './routes';
import webhooks from './routes/webhooks/index';
import { uploadRoutes } from './routes/upload.routes';
import cors from 'cors';

export const app: Application = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // Allow cookies to be sent
  }),
);

// route for webhooks
app.use('/webhooks', webhooks);

// Cookie parser must be before upload routes for authentication
app.use(cookieParser());

// Upload routes - must be before JSON parser to handle multipart data
app.use('/api/v1', uploadRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
