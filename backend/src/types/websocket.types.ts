import { Socket } from 'socket.io';
import { UserRole, User } from './user.types';
import { Order, OrderStatus } from './order.types';
import { OrderItem } from './orderItem.types';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: UserRole;
  storeId?: string;
  riderId?: string;
}

export interface SocketChannels {
  STORE: (storeId: string) => string;
  RIDER: (riderId: string) => string;
  ORDER: (orderId: string) => string;
  ADMIN_DASHBOARD: string;
}

// Complete order data for notifications TO STORES
export interface OrderNotificationPayload {
  order: Order;
  orderItems: OrderItem[];
  customer: Pick<User, '_id' | 'name' | 'surname' | 'email' | 'address'>;
  timestamp: Date;
}

// Rider offer with complete context OFFER TO RIDERS
export interface RiderOfferPayload {
  order: Order;
  orderItems: OrderItem[];
  customer: Pick<User, '_id' | 'name' | 'surname' | 'address'>;
  riderId: string;
  storeInfo: {
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
  };
  timeout: number;
  timestamp: Date;
}

// Order status updates with full context
export interface OrderStatusUpdatePayload {
  order: Order;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  timestamp: Date;
  details?: any;
}

// Delivery tracking with order context
export interface DeliveryTrackingPayload {
  orderId: string;
  riderId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'picked_up' | 'in_transit' | 'delivered';
  timestamp: Date;
}

// Response payloads
export interface RiderOfferResponse {
  orderId: string;
  riderId: string;
  accepted: boolean;
  timestamp: Date;
  reason?: string;
}

export interface StoreOrderResponse {
  orderId: string;
  storeId: string;
  accepted: boolean;
  timestamp: Date;
  reason?: string;
}
