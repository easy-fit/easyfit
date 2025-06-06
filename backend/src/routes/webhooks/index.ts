import { Router } from 'express';
import { sumsubRoutes } from './sumsub.routes';

const router = Router();

router.use('/sumsub', sumsubRoutes);

export default router;
