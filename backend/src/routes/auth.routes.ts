import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { assignRoleFromPath } from '../middlewares/auth';

export const authRoutes = Router();

authRoutes.post('/register', assignRoleFromPath, AuthController.register);
authRoutes.post('/register/rider', assignRoleFromPath, AuthController.register);
authRoutes.post(
  '/register/stores',
  assignRoleFromPath,
  AuthController.register,
);
authRoutes.post('/login', AuthController.login);
authRoutes.post('/logout', AuthController.logout);
authRoutes.post('/refresh-token', AuthController.refreshToken);
