import { Router } from 'express';
import { sumsubRoutes } from './sumsub.routes';
import { mercadoPagoRoutes } from './mercadoPago.routes';

const router = Router();

router.use('/sumsub', sumsubRoutes);
router.use('/mercadopago', mercadoPagoRoutes);

export default router;
