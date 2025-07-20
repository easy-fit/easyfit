import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { ENV } from '../config/env';

function handleCastErrorDB(err: any): AppError {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
}

function handleDuplicateFieldsDB(err: any): AppError {
  if (err.errmsg) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
    if (value) {
      const message = `Duplicated value: ${value[0]}. Use another one!`;
      return new AppError(message, 400);
    }
  }
  return new AppError('Duplicated value, use other instead!', 400);
}

function handleValidationErrorDB(err: any): AppError {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid data: ${errors.join('. ')}`;
  return new AppError(message, 400);
}

function handleJWTError(): AppError {
  return new AppError('Invalid token, login to get access', 401);
}

function handleJWTExpiredError(): AppError {
  return new AppError('Your token expired, login to get access', 401);
}

function sendErrorDev(err: any, res: Response) {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

function sendErrorProd(err: any, res: Response) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
}

export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (ENV.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (ENV.NODE_ENV === 'production') {
    let error: any = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
}
