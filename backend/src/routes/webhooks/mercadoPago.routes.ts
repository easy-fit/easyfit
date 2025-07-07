import express, { Router } from 'express';
import { MercadoPagoController } from '../../controllers/mercadoPago.controller';
import { validateMercadoPagoWebhook } from '../../middlewares/auth';

export const mercadoPagoRoutes = Router();

mercadoPagoRoutes.post(
  '/webhook',
  express.json(),
  validateMercadoPagoWebhook,
  MercadoPagoController.handleWebhook,
);
