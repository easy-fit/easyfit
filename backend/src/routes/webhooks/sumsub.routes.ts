import express, { Router } from 'express';
import { KYCController } from '../../controllers/kyc.controller';
import { validateSumsubWebhook } from '../../middlewares/auth';

export const sumsubRoutes = Router();

sumsubRoutes.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  validateSumsubWebhook,
  KYCController.handleWebhook,
);
