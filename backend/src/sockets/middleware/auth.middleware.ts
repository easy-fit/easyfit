import jwt from 'jsonwebtoken';
import { AuthenticatedSocket } from '../../types/websocket.types';
import { UserModel } from '../../models/user.model';
import { StoreModel } from '../../models/store.model';
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

    // For merchants, get their store ID
    if (user.role === 'merchant') {
      const store = await StoreModel.findOne({ merchantId: user._id }).select('_id').lean();
      if (store) {
        socket.storeId = store._id.toString();
        console.log(`Merchant ${socket.userId} connected with store ${socket.storeId}`);
      } else {
        console.warn(`Merchant ${socket.userId} has no associated store`);
        socket.storeId = undefined;
      }
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
