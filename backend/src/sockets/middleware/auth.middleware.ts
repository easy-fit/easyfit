import jwt from 'jsonwebtoken';
import { AuthenticatedSocket } from '../../types/websocket.types';
import { UserModel } from '../../models/user.model';
import { StoreModel } from '../../models/store.model';
import { JWT_CONFIG } from '../../config/env';

export const socketAuthMiddleware = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    // Try to get token from multiple sources: auth object, query params, or cookies
    const token = 
      socket.handshake.auth?.token || 
      (socket.handshake.query?.token as string) ||
      socket.handshake.headers?.cookie?.split(';')
        ?.find(cookie => cookie.trim().startsWith('jwt='))
        ?.split('=')[1];

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

    // For merchants, get all their store IDs
    if (user.role === 'merchant') {
      const stores = await StoreModel.find({ merchantId: user._id }).select('_id').lean();
      if (stores.length > 0) {
        socket.storeIds = stores.map(store => store._id.toString());
        // Keep backward compatibility: set storeId to first store for legacy handlers
        socket.storeId = socket.storeIds[0];
        console.log(`Merchant ${socket.userId} connected with ${socket.storeIds.length} stores: ${socket.storeIds.join(', ')}`);
      } else {
        console.warn(`Merchant ${socket.userId} has no associated stores`);
        socket.storeId = undefined;
        socket.storeIds = undefined;
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
