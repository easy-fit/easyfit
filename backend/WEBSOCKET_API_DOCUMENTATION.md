# EasyFit Backend WebSocket API Documentation

## Overview

The EasyFit backend implements a comprehensive WebSocket system for real-time communication between clients (customers, merchants, riders, admins) and the server. This document provides complete coverage of all WebSocket channels, events, and data flows.

## Authentication

All WebSocket connections require authentication via JWT token:

```javascript
// Client connection with authentication
const socket = io(SERVER_URL, {
  auth: {
    token: 'your-jwt-token',
  },
});
```

**Authentication Flow:**

- Token is verified using JWT middleware (`/src/sockets/middleware/auth.middleware.ts`)
- User information is extracted and attached to socket: `userId`, `userRole`, `storeId` (for merchants), `riderId` (for riders)
- Unauthorized connections are rejected

## Channel Structure

### Channel Naming Patterns

All channels follow consistent naming patterns defined in `/src/sockets/websocket.orchestrator.ts`:

```typescript
const CHANNELS = {
  STORE: (storeId: string) => `store:${storeId}`,
  RIDER: (riderId: string) => `rider:${riderId}`,
  ORDER: (orderId: string) => `order:${orderId}`,
  ADMIN_DASHBOARD: 'admin:dashboard',
};
```

### Automatic Channel Joining

Users automatically join role-specific channels upon connection:

| User Role  | Auto-Joined Channels | Condition                                |
| ---------- | -------------------- | ---------------------------------------- |
| `merchant` | `store:${storeId}`   | If storeId is available                  |
| `rider`    | `rider:${userId}`    | Always                                   |
| `admin`    | `admin:dashboard`    | Always                                   |
| `customer` | None initially       | Joins order channels manually via `customer:join:order` event |

## Events Reference

### 1. Client → Server Events (socket.on)

#### Store Events

**`store:order:response`**

- **Sender:** Merchants only
- **Purpose:** Accept or reject incoming orders
- **Payload:**

```typescript
interface StoreOrderResponse {
  orderId: string;
  storeId: string;
  accepted: boolean;
  timestamp: Date;
  reason?: string; // Required if rejected
}
```

- **Authorization:** Must be merchant with matching store
- **Response:** `order:response_confirmed` or `error`

#### Rider Events

**`rider:offer:response`**

- **Sender:** Riders only
- **Purpose:** Accept or reject delivery offers
- **Payload:**

```typescript
interface RiderOfferResponse {
  orderId: string;
  riderId: string;
  accepted: boolean;
  timestamp: Date;
  reason?: string; // Optional rejection reason
}
```

- **Authorization:** Must be rider with matching riderId
- **Response:** Order assignment if accepted, or offer continues to next rider

**`rider:availability:toggle`**

- **Sender:** Riders only
- **Purpose:** Toggle availability status (go online/offline like Uber's "GO" button)
- **Payload:**

```typescript
interface RiderAvailabilityToggle {
  riderId: string;
  isAvailable: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}
```

- **Authorization:** Must be rider with matching riderId
- **Response:** `rider:availability_confirmed` or `error`

**`rider:location:tracking`**

- **Sender:** Riders only
- **Purpose:** Update location while available/online (not during delivery)
- **Payload:**

```typescript
interface RiderLocationUpdate {
  riderId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}
```

- **Authorization:** Must be rider with matching riderId
- **Response:** `rider:location_confirmed` or `error`

**`rider:order:cancel`**

- **Sender:** Riders only
- **Purpose:** Cancel an accepted order (for mistakes or problems)
- **Payload:**

```typescript
interface RiderCancellationRequest {
  orderId: string;
  riderId: string;
  reason?: string;
  timestamp: Date;
}
```

- **Authorization:** Must be rider with matching riderId and order must be in rider_assigned status
- **Response:** `rider:cancellation_confirmed` or `error`

**`rider:location:update`**

- **Sender:** Riders only
- **Purpose:** Update location during delivery
- **Payload:**

```typescript
interface LocationUpdate {
  orderId: string;
  riderId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}
```

- **Authorization:** Must be assigned rider for the order
- **Response:** `delivery:location_confirmed` or `error`

**`delivery:status:update`**

- **Sender:** Riders only
- **Purpose:** Update delivery status
- **Payload:**

```typescript
interface DeliveryStatusUpdate {
  orderId: string;
  riderId: string;
  status: 'picked_up' | 'in_transit' | 'delivered';
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}
```

- **Authorization:** Must be assigned rider for the order
- **Response:** `delivery:status_confirmed` or `error`
- **Note:** For `delivered` status, system responds with info message directing to use verification code endpoint

#### Customer Events

**`customer:join:order`**

- **Sender:** Customers only
- **Purpose:** Join an order channel to receive real-time updates about a specific order
- **Payload:**

```typescript
interface CustomerJoinOrder {
  orderId: string;
}
```

- **Authorization:** Must be customer who owns the order
- **Response:** `customer:joined:order` or `error`
- **Usage:** Typically called when customer navigates to order tracking page

**`customer:leave:order`**

- **Sender:** Customers only
- **Purpose:** Leave an order channel when no longer needing real-time updates
- **Payload:**

```typescript
interface CustomerLeaveOrder {
  orderId: string;
}
```

- **Authorization:** Must be customer (order ownership not required for leaving)
- **Response:** `customer:left:order` or `error`
- **Usage:** Typically called when customer navigates away from order tracking page

#### Return Flow Events

**`return:pickup:confirm`**

- **Sender:** Riders only
- **Purpose:** Confirm collection of returned items from customer
- **Payload:**

```typescript
interface ReturnPickupConfirmation {
  orderId: string;
  riderId: string;
  confirmed: boolean;
}
```

- **Authorization:** Must be assigned rider
- **Response:** `return:pickup_confirmed` or `error`

**`return:store:delivery`**

- **Sender:** Riders only
- **Purpose:** Confirm delivery of returns to store
- **Payload:**

```typescript
interface StoreReturnDelivery {
  orderId: string;
  riderId: string;
}
```

- **Authorization:** Must be assigned rider
- **Response:** `return:store_delivery_confirmed` or `error`

**`return:inspection:complete`**

- **Sender:** Merchants only
- **Purpose:** Complete inspection of returned items
- **Payload:**

```typescript
interface StoreInspectionResult {
  orderId: string;
  storeId: string;
  returnStatus: 'returned_ok' | 'returned_partial' | 'returned_damaged';
  damagedItems?: Array<{
    variantId: string;
    reason: string;
  }>;
}
```

- **Authorization:** Must be merchant owning the store for the order
- **Response:** `return:inspection_completed` or `error`

### 2. Server → Client Events (emit)

#### Order Management Events

**`order:new`**

- **Recipients:** Store channel (`store:${storeId}`), Admin dashboard
- **Triggered:** When new order is placed
- **Payload:**

```typescript
{
  type: 'order_placed',
  data: {
    order: Order,
    orderItems: OrderItem[],
    customer: Pick<User, '_id' | 'name' | 'surname' | 'email' | 'address'>,
    timestamp: Date
  }
}
```

**`order:status_update`**

- **Recipients:** Order channel (`order:${orderId}`), Admin dashboard
- **Triggered:** When order status changes
- **Payload:**

```typescript
{
  type: 'status_update',
  data: {
    order: Order,
    previousStatus: OrderStatus,
    newStatus: OrderStatus,
    timestamp: Date,
    details?: any
  }
}
```

**`order:response_confirmed`**

- **Recipients:** Specific merchant socket
- **Triggered:** After successful store response processing
- **Payload:**

```typescript
{
  type: 'response_confirmed',
  data: StoreOrderResponse
}
```

**`order:assignment_confirmed`**

- **Recipients:** Specific rider (`rider:${riderId}`)
- **Triggered:** When rider accepts delivery offer
- **Payload:**

```typescript
{
  type: 'assignment_confirmed',
  data: {
    orderId: string,
    message: string,
    storeInfo: {
      name: string,
      location: { latitude: number, longitude: number }
    },
    timestamp: Date
  }
}
```

**`order:rider_assigned`**

- **Recipients:** Store channel (`store:${storeId}`)
- **Triggered:** When rider is assigned to order
- **Payload:**

```typescript
{
  type: 'rider_assigned',
  data: {
    orderId: string,
    riderId: string,
    message: string,
    timestamp: Date
  }
}
```

**`order:assignment_issue`**

- **Recipients:** Admin dashboard only
- **Triggered:** When order has been waiting for rider assignment for 10+ minutes
- **Payload:**

```typescript
{
  type: 'assignment_issue',
  priority: 'high',
  data: {
    orderId: string,
    order: Order,
    customer: User,
    duration: string,
    message: string,
    timestamp: Date
  }
}
```

#### Rider Offer Events

**`rider:offer`**

- **Recipients:** Specific rider (`rider:${riderId}`)
- **Triggered:** When delivery offer is sent to rider
- **Payload:**

```typescript
{
  type: 'delivery_offer',
  data: {
    order: Order,
    orderItems: OrderItem[],
    customer: Pick<User, '_id' | 'name' | 'surname' | 'address'>,
    riderId: string,
    storeInfo: {
      name: string,
      location: { latitude: number, longitude: number }
    },
    timeout: number, // Milliseconds
    timestamp: Date
  },
  offerId: string
}
```

**`rider:offer_response`**

- **Recipients:** Admin dashboard only
- **Triggered:** When rider responds to offer (accept/reject)
- **Payload:**

```typescript
{
  type: 'rider_offer_response',
  data: RiderOfferResponse
}
```

#### Delivery Tracking Events

**`delivery:tracking_update`**

- **Recipients:** Order channel (`order:${orderId}`), Admin dashboard
- **Triggered:** When rider updates location during delivery
- **Payload:**

```typescript
{
  type: 'delivery_tracking',
  data: {
    orderId: string,
    riderId: string,
    location: { latitude: number, longitude: number },
    status: 'picked_up' | 'in_transit' | 'delivered',
    timestamp: Date
  }
}
```

**`delivery:location_confirmed`**

- **Recipients:** Specific rider socket
- **Triggered:** After successful location update
- **Payload:**

```typescript
{
  type: 'location_confirmed',
  timestamp: Date
}
```

**`delivery:status_confirmed`**

- **Recipients:** Specific rider socket
- **Triggered:** After successful status update
- **Payload:**

```typescript
{
  type: 'status_confirmed',
  data: DeliveryStatusUpdate & { timestamp: Date }
}
```

#### Rider Availability Events

**`rider:availability_confirmed`**

- **Recipients:** Specific rider socket
- **Triggered:** After successful availability toggle
- **Payload:**

```typescript
{
  type: 'availability_confirmed',
  data: {
    riderId: string,
    isAvailable: boolean,
    location?: { latitude: number, longitude: number },
    timestamp: Date
  }
}
```

**`rider:availability_changed`**

- **Recipients:** Admin dashboard
- **Triggered:** When rider toggles availability status
- **Payload:**

```typescript
{
  type: 'rider_availability_changed',
  data: {
    riderId: string,
    isAvailable: boolean,
    location?: { latitude: number, longitude: number },
    timestamp: Date
  }
}
```

**`rider:location_confirmed`**

- **Recipients:** Specific rider socket
- **Triggered:** After successful location update while available
- **Payload:**

```typescript
{
  type: 'location_confirmed',
  data: {
    riderId: string,
    location: { latitude: number, longitude: number },
    timestamp: Date
  }
}
```

**`rider:cancellation_confirmed`**

- **Recipients:** Specific rider socket
- **Triggered:** After successful order cancellation
- **Payload:**

```typescript
{
  type: 'cancellation_confirmed',
  data: {
    orderId: string,
    riderId: string,
    message: string,
    reason?: string,
    timestamp: Date
  }
}
```

**`customer:joined:order`**

- **Recipients:** Specific customer socket
- **Triggered:** After successfully joining an order channel
- **Payload:**

```typescript
{
  orderId: string,
  success: boolean
}
```

**`customer:left:order`**

- **Recipients:** Specific customer socket
- **Triggered:** After successfully leaving an order channel
- **Payload:**

```typescript
{
  orderId: string,
  success: boolean
}
```

**`rider:order_cancelled`**

- **Recipients:** Store channel (`store:${storeId}`)
- **Triggered:** When rider cancels an order
- **Payload:**

```typescript
{
  type: 'rider_order_cancelled',
  data: {
    orderId: string,
    riderId: string,
    message: string,
    reason?: string,
    timestamp: Date
  }
}
```

**`order:rider_cancelled`**

- **Recipients:** Order channel (`order:${orderId}`)
- **Triggered:** When rider cancels an order (customer notification)
- **Payload:**

```typescript
{
  type: 'order_rider_cancelled',
  data: {
    orderId: string,
    message: string,
    reassigning: boolean,
    timestamp: Date
  }
}
```

**`rider:cancellation_reported`**

- **Recipients:** Admin dashboard only
- **Triggered:** When rider cancels an order
- **Payload:**

```typescript
{
  type: 'rider_cancellation_reported',
  data: {
    orderId: string,
    riderId: string,
    reason?: string,
    reassigning: boolean,
    timestamp: Date
  }
}
```

#### Try Period Events

**`try_period:update`**

- **Recipients:** Order channel (`order:${orderId}`), Assigned rider, Admin dashboard
- **Triggered:** When try period status changes
- **Payload:**

```typescript
{
  type: 'try_period_update',
  data: {
    orderId: string,
    type: 'try_period_started' | 'try_period_updated' | 'try_period_expired' | 'try_period_finalized',
    tryPeriod?: TryPeriodInfo,
    items?: any[],
    timestamp: Date
  }
}
```

#### Return Flow Events

**`return:pickup_required`**

- **Recipients:** Assigned rider (`rider:${riderId}`)
- **Triggered:** When order status becomes `awaiting_return_pickup`
- **Payload:**

```typescript
{
  type: 'return_pickup_required',
  data: {
    orderId: string,
    returnedItems: number,
    message: string,
    timestamp: Date
  }
}
```

**`return:rider_coming`**

- **Recipients:** Order channel (`order:${orderId}`)
- **Triggered:** When order status becomes `awaiting_return_pickup`
- **Payload:**

```typescript
{
  type: 'return_rider_coming',
  data: {
    orderId: string,
    message: string,
    timestamp: Date
  }
}
```

**`return:pickup_confirmed`**

- **Recipients:** Specific rider socket
- **Triggered:** After rider confirms return pickup
- **Payload:**

```typescript
{
  type: 'return_pickup_confirmed',
  data: {
    orderId: string,
    message: string,
    timestamp: Date
  }
}
```

**`return:rider_returning`**

- **Recipients:** Store channel (`store:${storeId}`), Admin dashboard
- **Triggered:** When order status becomes `returning_to_store`
- **Payload:**

```typescript
{
  type: 'return_rider_returning',
  data: {
    orderId: string,
    riderId: string,
    message: string,
    timestamp: Date
  }
}
```

**`return:store_delivery_confirmed`**

- **Recipients:** Specific rider socket
- **Triggered:** After rider confirms store delivery
- **Payload:**

```typescript
{
  type: 'return_store_delivery_confirmed',
  data: {
    orderId: string,
    message: string,
    timestamp: Date
  }
}
```

**`return:inspect_items`**

- **Recipients:** Store channel (`store:${storeId}`)
- **Triggered:** When order status becomes `store_checking_returns`
- **Payload:**

```typescript
{
  type: 'return_inspect_items',
  data: {
    orderId: string,
    returnedItems: OrderItem[],
    message: string,
    timestamp: Date
  }
}
```

**`return:inspection_started`**

- **Recipients:** Admin dashboard only
- **Triggered:** When order status becomes `store_checking_returns`
- **Payload:**

```typescript
{
  type: 'return_inspection_started',
  data: {
    orderId: string,
    returnedItemsCount: number,
    timestamp: Date
  }
}
```

**`return:inspection_completed`**

- **Recipients:** Specific merchant socket
- **Triggered:** After store completes inspection
- **Payload:**

```typescript
{
  type: 'return_inspection_completed',
  data: {
    orderId: string,
    returnStatus: 'returned_ok' | 'returned_partial' | 'returned_damaged',
    message: string,
    timestamp: Date
  }
}
```

**`return:damaged_items_reported`**

- **Recipients:** Admin dashboard only
- **Triggered:** When store reports damaged items during inspection
- **Payload:**

```typescript
{
  type: 'return_damaged_items_reported',
  data: {
    orderId: string,
    storeId: string,
    damagedItems: Array<{ variantId: string, reason: string }>,
    timestamp: Date
  }
}
```

#### System & Error Events

**`system:error`**

- **Recipients:** Admin dashboard only
- **Triggered:** When critical errors occur
- **Payload:**

```typescript
{
  type: 'critical_error',
  data: {
    timestamp: Date,
    operation: string,
    stage: string,
    orderId?: string,
    riderId?: string,
    storeId?: string,
    userId?: string,
    error: {
      message: string,
      stack?: string,
      name: string
    },
    metadata?: any,
    severity: 'critical' | 'high'
  }
}
```

**`system:recovery`**

- **Recipients:** Admin dashboard only
- **Triggered:** When failed operations recover after retries
- **Payload:**

```typescript
{
  type: 'operation_recovered',
  data: {
    operation: string,
    orderId?: string,
    attempts: number,
    timestamp: Date
  }
}
```

**`system:fallback`**

- **Recipients:** Admin dashboard only
- **Triggered:** When fallback strategies are executed
- **Payload:**

```typescript
{
  type: 'fallback_executed',
  data: {
    operation: string,
    strategy: string,
    orderId?: string,
    timestamp: Date
  }
}
```

**`system:warning`**

- **Recipients:** Admin dashboard only
- **Triggered:** When non-critical WebSocket failures occur
- **Payload:**

```typescript
{
  type: 'websocket_failure',
  data: {
    operation: string,
    targetId: string,
    error: string,
    timestamp: Date
  }
}
```

#### Universal Events

**`error`**

- **Recipients:** Individual socket that caused the error
- **Triggered:** When client sends invalid requests or lacks authorization
- **Payload:**

```typescript
{
  message: string;
}
```

**`info`**

- **Recipients:** Individual socket
- **Triggered:** For informational messages
- **Payload:**

```typescript
{
  message: string;
}
```
