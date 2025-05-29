import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

export const userRoutes = Router();

userRoutes.get('/me', UserController.getMe);

userRoutes
  .route('/')
  .get(UserController.getUsers)
  .post(UserController.createUser);

userRoutes
  .route('/:id')
  .get(UserController.getUserById)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);
