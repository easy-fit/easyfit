import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AppError } from '../utils/appError';
import { CreateUserDTO, UpdateUserDTO } from '../types/user.types';
import { catchAsync } from '../utils/catchAsync';

export class UserController {
  static getMe = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const user = await UserService.getUserById(req.user._id);
    res.status(200).json({ user });
  });

  static getUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await UserService.getUsers();
    res.status(200).json({ total: users.length, users });
  });

  static getUserById = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.getUserById(req.params.id);
    res.status(200).json({ user });
  });

  static createUser = catchAsync(async (req: Request, res: Response) => {
    const dto: CreateUserDTO = req.body;
    const user = await UserService.createUser(dto);
    res.status(201).json({ user });
  });

  static updateUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const dto: UpdateUserDTO = req.body;
    const user = await UserService.updateUser(id, dto);
    res.status(200).json({ user });
  });

  static deleteUser = catchAsync(async (req: Request, res: Response) => {
    await UserService.deleteUser(req.params.id);
    res.status(204).json({ status: 'success' });
  });
}
