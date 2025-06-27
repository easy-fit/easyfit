import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDTO, UpdateUserDTO } from '../types/user.types';
import { catchAsync } from '../utils/catchAsync';

export class UserController {
  static getMe = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const user = await UserService.getUserById(userId);
    res.status(200).json({ user });
  });

  static getUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await UserService.getUsers();
    res.status(200).json({ total: users.length, users });
  });

  static getUserById = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const user = await UserService.getUserById(userId);
    res.status(200).json({ user });
  });

  static createUser = catchAsync(async (req: Request, res: Response) => {
    const data: CreateUserDTO = req.body;
    const user = await UserService.createUser(data);
    res.status(201).json({ user });
  });

  static updateUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const data: UpdateUserDTO = req.body;
    const user = await UserService.updateUser(userId, data);
    res.status(200).json({ user });
  });

  static updateMe = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const data: UpdateUserDTO = req.body;
    const user = await UserService.updateUser(userId, data);
    res.status(200).json({ user });
  });

  static updateMyAddress = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { address } = req.body;
    const user = await UserService.updateUser(userId, { address });
    res.status(200).json({ user });
  });

  static deleteUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.id;
    await UserService.deleteUser(userId);
    res.status(204).json({ status: 'success' });
  });
}
