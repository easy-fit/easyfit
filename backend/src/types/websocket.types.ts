import { Socket } from 'socket.io';
import { UserRole } from './user.types';
import { OrderStatus } from './order.types';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: UserRole;
  storeId?: string; // Keep for backward compatibility with single-store cases
  storeIds?: string[]; // Array of store IDs for merchants with multiple stores
  riderId?: string;
}

export interface SocketChannels {
  STORE: (storeId: string) => string;
  RIDER: (riderId: string) => string;
  ORDER: (orderId: string) => string;
  ADMIN_DASHBOARD: string;
}

// Optimized order data for store notifications
export interface OrderNotificationPayload {
  order: {
    _id: string;
    total: number;
    status: OrderStatus;
    paymentStatus: string;
    shipping: {
      address: {
        formatted: {
          building: any;
          floor: any;
          apartment: string;
          street: string;
          streetNumber: string;
          city: string;
          province: string;
          postalCode: string;
        };
        coordinates: [number, number];
      };
      cost: number;
      type: string;
      tryOnEnabled: boolean;
    };
    createdAt: Date;
  };
  orderItems: {
    _id: string;
    quantity: number;
    unitPrice: number;
    returnStatus: string;
    product: {
      _id: string;
      title: string;
      category: string;
    };
    variant: {
      _id: string;
      size: string;
      color: string;
      images: Array<{
        key: string;
        altText: string;
        order: number;
      }>;
    };
  }[];
  customer: {
    _id: string;
    name: string;
    surname: string;
    email: string;
    address: {
      formatted:
        | {
            street: string;
            streetNumber: string;
            apartment?: string;
            floor?: string;
            building?: string;
            city: string;
            province: string;
            postalCode: string;
          }
        | {};
    };
  };
  timestamp: Date;
}

// Optimized rider offer payload
export interface RiderOfferPayload {
  order: {
    _id: string;
    shipping: {
      type: string;
      address: {
        formatted: {
          street: string;
          streetNumber: string;
          apartment?: string;
          floor?: string;
          building?: string;
        };
      };
      distance: number; // Distance in kilometers
      cost: number;
      tryOnEnabled: boolean;
    };
  };
  storeInfo: {
    name: string;
    address: {
      formatted: {
        street: string;
        streetNumber: string;
        apartment?: string;
        floor?: string;
        building?: string;
      };
    };
  };
  riderId: string;
  timeout: number;
  timestamp: Date;
}

// Minimal order status updates
export interface OrderStatusUpdatePayload {
  order: {
    _id: string;
    status: OrderStatus;
    total: number;
  };
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

export interface RiderCancellationRequest {
  orderId: string;
  riderId: string;
  reason?: string;
  timestamp: Date;
}
