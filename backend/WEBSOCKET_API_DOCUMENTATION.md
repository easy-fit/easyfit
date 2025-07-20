# EasyFit Backend WebSocket API Documentation

## Overview

The EasyFit backend implements a comprehensive WebSocket system for real-time communication between clients (customers, merchants, riders, admins) and the server. This document provides complete coverage of all WebSocket channels, events, and data flows.

## Authentication

All WebSocket connections require authentication via JWT token:
```javascript
// Client connection with authentication
const socket = io(SERVER_URL, {
  auth: {
    token: 'your-jwt-token'
  }
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
  ADMIN_DASHBOARD: 'admin:dashboard'
};
```

### Automatic Channel Joining

Users automatically join role-specific channels upon connection:

| User Role | Auto-Joined Channels | Condition |
|-----------|---------------------|-----------|
| `merchant` | `store:${storeId}` | If storeId is available |
| `rider` | `rider:${userId}` | Always |
| `admin` | `admin:dashboard` | Always |
| `customer` | None initially | Joins order channels when placing orders |

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
  verificationCode?: string; // Not used for delivery confirmation
}
```
- **Authorization:** Must be assigned rider for the order
- **Response:** `delivery:status_confirmed` or `error`
- **Note:** For `delivered` status, system responds with info message directing to use verification code endpoint

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
  message: string
}
```

**`info`**
- **Recipients:** Individual socket
- **Triggered:** For informational messages
- **Payload:**
```typescript
{
  message: string
}
```

## Order Status Flow & WebSocket Events

### Complete Order Lifecycle

```
order_placed 
    ↓ (store accepts) → WebSocket: order:status_update
order_accepted 
    ↓ (rider found) → WebSocket: order:rider_assigned, order:assignment_confirmed
rider_assigned 
    ↓ (rider picks up) → WebSocket: order:status_update, delivery:tracking_update
in_transit 
    ↓ (delivery confirmed) → WebSocket: order:status_update
delivered 
    ↓ (customer decisions)
    ├── purchased (all kept) → WebSocket: order:status_update
    └── awaiting_return_pickup (has returns) → WebSocket: return:pickup_required, return:rider_coming
         ↓ (rider collects)
    returning_to_store → WebSocket: return:rider_returning
         ↓ (rider delivers to store)
    store_checking_returns → WebSocket: return:inspect_items, return:inspection_started
         ↓ (store inspection)
    └── returned_ok/returned_partial/returned_damaged → WebSocket: order:status_update
```

### Missing or Incomplete Flows

Based on the analysis, here are potential gaps:

1. **Customer Joining Order Channels**: Customers don't automatically join order channels - this needs to be implemented when orders are placed or delivered.

2. **Store ID Resolution**: Merchant authentication doesn't automatically set `storeId` - this requires additional logic to map merchants to their stores.

3. **Rider Location Updates**: While riders can send location updates, there's no automatic broadcasting to customers tracking their delivery.

4. **Order Cancellation Events**: Order cancellation triggers status updates but lacks specific cancellation events for different scenarios (customer cancellation, store cancellation, system cancellation).

5. **Payment Events**: No WebSocket events for payment status changes, refunds, or settlement completion.

6. **Inventory Updates**: No real-time inventory updates when items are purchased or returned.

## WebSocket Service Integration

### Service Integration Points

1. **OrderService** (`/src/services/order.service.ts`)
   - Emits: `order:new`, `order:status_update`
   - On: Order creation, store responses

2. **OrderStateManager** (`/src/services/orderStateManager.service.ts`)
   - Emits: `order:status_update`, `return:*` events
   - On: All order status transitions

3. **RiderAssignmentOrchestrator** (`/src/services/riderAssignmentOrchestrator.service.ts`)
   - Emits: `rider:offer`, `order:assignment_confirmed`, `order:rider_assigned`, `order:assignment_issue`
   - On: Rider assignment process

4. **TryPeriodManager** (`/src/services/tryPeriodManager.service.ts`)
   - Emits: `try_period:update`
   - On: Try period lifecycle events

5. **DeliveryTrackingService** (`/src/services/deliveryTracking.service.ts`)
   - Emits: `delivery:tracking_update`
   - On: Location updates

6. **ErrorHandlingService** (`/src/services/errorHandling.service.ts`)
   - Emits: `system:error`, `system:recovery`, `system:fallback`, `system:warning`
   - On: System errors and recoveries

## Security Considerations

1. **Authorization**: All event handlers verify user roles and permissions
2. **Data Isolation**: Users can only access data relevant to their role and assigned entities
3. **Rate Limiting**: Consider implementing rate limiting for location updates and other frequent events
4. **Input Validation**: All incoming data should be validated against schemas
5. **Error Handling**: Sensitive error information is not exposed to clients

## Performance Considerations

1. **Channel Management**: Efficient channel joining/leaving based on user activities
2. **Memory Management**: Cleanup of expired offers and timeouts in RiderOfferHandler
3. **Database Queries**: Minimize database calls in WebSocket handlers
4. **Event Batching**: Consider batching frequent events like location updates

## Development Recommendations

1. **Add Customer Order Channel Management**: Implement logic to add customers to order channels when orders are placed
2. **Enhance Store-Merchant Mapping**: Improve merchant authentication to properly set storeId
3. **Add Payment Events**: Implement WebSocket events for payment lifecycle
4. **Add Inventory Events**: Real-time inventory updates for stores
5. **Improve Error Specificity**: More specific error events for different failure scenarios
6. **Add Heartbeat/Health Checks**: Implement connection health monitoring
7. **Add Event Acknowledgments**: Implement acknowledgment system for critical events