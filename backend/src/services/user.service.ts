import { UserModel } from '../models/user.model';
import { AppError } from '../utils/appError';
import { CreateUserDTO, UpdateUserDTO } from '../types/user.types';
import { isDeliveryLocationValid } from '../utils/distance';

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
    await this.ensureUserNotExists(data.email);
    return UserModel.create(data);
  }

  static async updateUser(userId: string, data: UpdateUserDTO) {
    if (data.address) {
      const userCoordinates = {
        latitude: data.address.location.coordinates[0],
        longitude: data.address.location.coordinates[1],
      };

      const isValidDeliveryLocation = isDeliveryLocationValid(userCoordinates);
      if (!isValidDeliveryLocation) {
        throw new AppError('Invalid delivery address', 400);
      }
    }
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

  static async ensureUserNotExists(email: string) {
    const existingUser = await UserModel.findOne({ email });

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
