import { Router } from 'express';
import { KYCController } from '../controllers/kyc.controller';
import { protect, restrictTo } from '../middlewares/auth';

export const kycRoutes = Router();

kycRoutes.use(protect);
kycRoutes.use(restrictTo('admin', 'rider', 'merchant'));

kycRoutes.post('/applicants', KYCController.createApplicant);
kycRoutes.post('/sdk-links', KYCController.generateWebSDKLink);
