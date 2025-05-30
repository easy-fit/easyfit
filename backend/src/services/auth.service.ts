import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { AppError } from '../utils/appError';
import { UserService } from './user.service';
import { comparePasswords, hashPassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt';
import { LoginDTO, RegisterDTO } from '../types/user.types';

export class AuthService {
  static async register(data: RegisterDTO) {
    await UserService.ensureUserNotExists(data.email, data.phone);

    const hashedPassword = await hashPassword(data.password);
    const user = await UserModel.create({
      ...data,
      passwordHash: hashedPassword,
    });

    const refreshToken = signRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return user;
  }

  static async login({ email, password }: LoginDTO) {
    const user = await UserModel.findOne({ email }).select('+passwordHash');
    if (!user || !(await comparePasswords(password, user.passwordHash))) {
      throw new AppError('Invalid email or password', 401);
    }

    const refreshToken = signRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return user;
  }

  static async logout(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }

  static async refreshToken(token: string) {
    const decoded = verifyToken(token) as jwt.JwtPayload;
    const user = await UserModel.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 403);
    }

    user.refreshToken = signRefreshToken(user._id.toString());
    await user.save({ validateBeforeSave: false });

    return user;
  }
}
