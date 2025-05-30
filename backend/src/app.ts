import express, { Application, NextFunction, Request, Response } from 'express';
import { AppError } from './utils/appError';
import { globalErrorHandler } from './controllers/error.controller';
import apiRoutes from './routes';

export const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', apiRoutes);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
