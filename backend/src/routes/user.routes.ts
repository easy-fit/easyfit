import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth';

export const userRoutes = Router();

userRoutes.use(protect);
userRoutes.get('/me', UserController.getMe);
userRoutes.patch('/me', UserController.updateMe);
userRoutes.patch('/me/address', UserController.updateMyAddress);

userRoutes.use(restrictTo('admin'));
userRoutes
  .route('/')
  .get(UserController.getUsers)
  .post(UserController.createUser);

userRoutes
  .route('/:id')
  .get(UserController.getUserById)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);
