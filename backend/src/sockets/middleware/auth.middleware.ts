import jwt from 'jsonwebtoken';
import { AuthenticatedSocket } from '../../types/websocket.types';
import { UserModel } from '../../models/user.model';
import { JWT_CONFIG } from '../../config/env';

export const socketAuthMiddleware = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth?.token || (socket.handshake.query?.token as string);

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as { id: string };

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;

    // For merchants, get their store ID (assuming they have one store for now)
    if (user.role === 'merchant') {
      // TODO: Get store ID from StoreModel where merchantId = user._id
      // For now, we'll set it when the store connects
      socket.storeId = undefined; // Will be set by store-specific logic
    }

    if (user.role === 'rider') {
      socket.riderId = user._id.toString();
    }

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
};
