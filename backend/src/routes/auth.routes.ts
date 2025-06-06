import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import {
  assignRoleFromPath,
  protect,
  isEmailVerified,
} from '../middlewares/auth';

export const authRoutes = Router();

authRoutes.post('/register', assignRoleFromPath, AuthController.register);
authRoutes.post(
  '/register/riders',
  assignRoleFromPath,
  AuthController.register,
);
authRoutes.post(
  '/register/stores',
  assignRoleFromPath,
  AuthController.register,
);
authRoutes.post('/login', AuthController.login);

authRoutes.post('/forgot-password', AuthController.forgotPassword);
authRoutes.post('/reset-password/:token', AuthController.resetPassword);

authRoutes.use(protect);

authRoutes.post('/verify-email', AuthController.verifyEmail);
authRoutes.post('/verify-email/resend', AuthController.sendVerificationCode);

authRoutes.patch(
  '/update-password',
  isEmailVerified,
  AuthController.updatePassword,
);
authRoutes.post('/logout', AuthController.logout);
authRoutes.post('/refresh-token', AuthController.refreshToken);
