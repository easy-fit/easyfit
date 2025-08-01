/* eslint-disable @typescript-eslint/no-explicit-any */
// WebSocket event types for frontend

// ============ Client to Server Events ============

// Customer Events
export interface CustomerJoinOrder {
  orderId: string;
}

export interface CustomerLeaveOrder {
  orderId: string;
}

// Merchant Events
export interface StoreOrderResponse {
  orderId: string;
  storeId: string;
  accepted: boolean;
  timestamp: Date;
  reason?: string;
}

export interface StoreInspectionResult {
  orderId: string;
  storeId: string;
  returnStatus: 'returned_ok' | 'returned_partial' | 'returned_damaged';
  damagedItems?: Array<{
    variantId: string;
    reason: string;
  }>;
}

// ============ Server to Client Events ============

// Order Events
export interface OrderNewEvent {
  type: 'order_placed';
  data: {
    order: any; // Using any for now, can be typed later
    orderItems: any[];
    customer: any;
    timestamp: Date;
  };
}

export interface OrderStatusUpdateEvent {
  type: 'status_update';
  data: {
    order: any;
    previousStatus: string;
    newStatus: string;
    timestamp: Date;
    details?: any;
  };
}

export interface OrderResponseConfirmedEvent {
  type: 'response_confirmed';
  data: StoreOrderResponse;
}

export interface OrderRiderAssignedEvent {
  type: 'rider_assigned';
  data: {
    orderId: string;
    riderId: string;
    message: string;
    timestamp: Date;
  };
}

// Delivery Events
export interface DeliveryTrackingEvent {
  type: 'delivery_tracking';
  data: {
    orderId: string;
    riderId: string;
    location: { latitude: number; longitude: number };
    status: 'picked_up' | 'in_transit' | 'delivered';
    timestamp: Date;
  };
}

// Try Period Events
export interface TryPeriodUpdateEvent {
  type: 'try_period_update';
  data: {
    orderId: string;
    type: 'try_period_started' | 'try_period_updated' | 'try_period_expired' | 'try_period_finalized';
    tryPeriod?: any;
    items?: any[];
    timestamp: Date;
  };
}

// Return Events
export interface ReturnRiderComingEvent {
  type: 'return_rider_coming';
  data: {
    orderId: string;
    message: string;
    timestamp: Date;
  };
}

export interface ReturnInspectItemsEvent {
  type: 'return_inspect_items';
  data: {
    orderId: string;
    returnedItems: any[];
    message: string;
    timestamp: Date;
  };
}

export interface ReturnInspectionCompletedEvent {
  type: 'return_inspection_completed';
  data: {
    orderId: string;
    returnStatus: 'returned_ok' | 'returned_partial' | 'returned_damaged';
    message: string;
    timestamp: Date;
  };
}

// Admin Events
export interface OrderAssignmentIssueEvent {
  type: 'assignment_issue';
  priority: 'high';
  data: {
    orderId: string;
    order: any;
    customer: any;
    duration: string;
    message: string;
    timestamp: Date;
  };
}

export interface SystemErrorEvent {
  type: 'critical_error';
  data: {
    timestamp: Date;
    operation: string;
    stage: string;
    orderId?: string;
    riderId?: string;
    storeId?: string;
    userId?: string;
    error: {
      message: string;
      stack?: string;
      name: string;
    };
    metadata?: any;
    severity: 'critical' | 'high';
  };
}

export interface RiderAvailabilityEvent {
  type: 'rider_availability_changed';
  data: {
    riderId: string;
    isAvailable: boolean;
    location?: { latitude: number; longitude: number };
    timestamp: Date;
  };
}

// Customer join/leave responses
export interface CustomerJoinedOrderEvent {
  orderId: string;
  success: boolean;
}

export interface CustomerLeftOrderEvent {
  orderId: string;
  success: boolean;
}

// Universal Events
export interface ErrorEvent {
  message: string;
}

export interface InfoEvent {
  message: string;
}

// ============ Event Type Unions ============

// Events that customers care about
export type CustomerEvent =
  | OrderStatusUpdateEvent
  | DeliveryTrackingEvent
  | TryPeriodUpdateEvent
  | ReturnRiderComingEvent
  | CustomerJoinedOrderEvent
  | CustomerLeftOrderEvent
  | ErrorEvent
  | InfoEvent;

// Events that merchants care about
export type MerchantEvent =
  | OrderNewEvent
  | OrderResponseConfirmedEvent
  | OrderRiderAssignedEvent
  | ReturnInspectItemsEvent
  | ReturnInspectionCompletedEvent
  | ErrorEvent
  | InfoEvent;

// Events that admins care about
export type AdminEvent = OrderAssignmentIssueEvent | SystemErrorEvent | RiderAvailabilityEvent | ErrorEvent | InfoEvent;

// All possible events
export type WebSocketEvent = CustomerEvent | MerchantEvent | AdminEvent;

// ============ Event Names ============

export const CUSTOMER_EVENTS = {
  // Outgoing
  JOIN_ORDER: 'customer:join:order',
  LEAVE_ORDER: 'customer:leave:order',

  // Incoming
  ORDER_STATUS_UPDATE: 'order:status_update',
  DELIVERY_TRACKING: 'delivery:tracking_update',
  TRY_PERIOD_UPDATE: 'try_period:update',
  RETURN_RIDER_COMING: 'return:rider_coming',
  JOINED_ORDER: 'customer:joined:order',
  LEFT_ORDER: 'customer:left:order',
} as const;

export const MERCHANT_EVENTS = {
  // Outgoing
  ORDER_RESPONSE: 'store:order:response',
  RETURN_INSPECTION: 'return:inspection:complete',

  // Incoming
  ORDER_NEW: 'order:new',
  ORDER_RESPONSE_CONFIRMED: 'order:response_confirmed',
  ORDER_RIDER_ASSIGNED: 'order:rider_assigned',
  RETURN_INSPECT_ITEMS: 'return:inspect_items',
  RETURN_INSPECTION_COMPLETED: 'return:inspection_completed',
} as const;

export const ADMIN_EVENTS = {
  // Incoming
  ORDER_ASSIGNMENT_ISSUE: 'order:assignment_issue',
  SYSTEM_ERROR: 'system:error',
  RIDER_AVAILABILITY_CHANGED: 'rider:availability_changed',
} as const;

export const COMMON_EVENTS = {
  ERROR: 'error',
  INFO: 'info',
} as const;
