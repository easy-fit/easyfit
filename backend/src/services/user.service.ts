import { UserModel } from '../models/user.model';
import { AppError } from '../utils/appError';
import { CreateUserDTO, UpdateUserDTO } from '../types/user.types';

export class UserService {
  static async getUsers() {
    return UserModel.find().select('-passwordHash');
  }

  static async getUserById(userId: string) {
    const user = await UserModel.findById(userId);
    this.ensureUserExists(user);
    return user;
  }

  static async createUser(data: CreateUserDTO) {
    await this.ensureUserNotExists(data.email, data.phone);
    return UserModel.create(data);
  }

  static async updateUser(userId: string, data: UpdateUserDTO) {
    const user = await UserModel.findByIdAndUpdate(userId, data, {
      new: true,
    });
    this.ensureUserExists(user);
    return user;
  }

  static async deleteUser(userId: string) {
    const user = await UserModel.findByIdAndDelete(userId);
    this.ensureUserExists(user);
  }

  static async ensureUserNotExists(email: string, phone: string) {
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      throw new AppError('User with this email or phone already exists', 400);
    }
  }

  private static ensureUserExists(user: any): void {
    if (!user) {
      throw new AppError('User not found', 404);
    }
  }
}
