# WebSocket Code Examples - EasyFit Backend

This document provides practical code examples for implementing WebSocket events in the EasyFit system. All examples use TypeScript.

## 🔌 **Backend Code Examples**

### **📡 Backend Emitting Events**

#### **Order Lifecycle Events**

```typescript
// New order notification to store
socket.to(`store:${storeId}`).emit('order:new', {
  type: 'order_placed',
  data: {
    order: orderData.order,
    orderItems: orderData.orderItems,
    customer: orderData.customer,
    timestamp: new Date()
  }
});

// Order status update to customer and admin
socket.to(`order:${orderId}`).emit('order:status_update', {
  type: 'status_update',
  data: {
    order: Order,
    previousStatus: 'delivered',
    newStatus: 'purchased',
    timestamp: new Date(),
    details: { message: 'Order completed successfully' }
  }
});

// Store response confirmation
socket.emit('order:response_confirmed', {
  type: 'response_confirmed',
  data: {
    orderId: 'order123',
    accepted: true,
    timestamp: new Date()
  }
});

// Order assignment issue alert to admin
socket.to('admin:dashboard').emit('order:assignment_issue', {
  type: 'assignment_issue',
  priority: 'high',
  data: {
    orderId: 'order123',
    message: 'Order has been waiting for rider assignment for over 10 minutes',
    duration: '10+ minutes',
    timestamp: new Date()
  }
});
```

#### **Rider Management Events**

```typescript
// Delivery offer to rider
socket.to(`rider:${riderId}`).emit('rider:offer', {
  type: 'delivery_offer',
  data: {
    orderId: 'order123',
    timeout: 30000,
    orderItems: orderItems,
    customer: customerData,
    storeInfo: {
      name: 'Store Name',
      location: { latitude: 40.7128, longitude: -74.0060 }
    },
    timestamp: new Date()
  }
});

// Assignment confirmation to rider
socket.to(`rider:${riderId}`).emit('order:assignment_confirmed', {
  type: 'assignment_confirmed',
  data: {
    orderId: 'order123',
    message: 'Order assigned successfully! Head to the store.',
    storeInfo: storeData,
    timestamp: new Date()
  }
});

// Delivery status confirmation
socket.emit('delivery:status_confirmed', {
  type: 'status_confirmed',
  data: {
    orderId: 'order123',
    status: 'picked_up',
    location: { latitude: 40.7128, longitude: -74.0060 },
    timestamp: new Date()
  }
});
```

#### **Try Period Events**

```typescript
// Try period lifecycle updates
socket.to(`order:${orderId}`).emit('try_period:update', {
  type: 'try_period_update',
  data: {
    orderId: 'order123',
    type: 'try_period_started', // or 'try_period_updated', 'try_period_expired', 'try_period_finalized'
    tryPeriod: {
      isActive: true,
      startedAt: new Date(),
      endsAt: new Date(Date.now() + 600000), // 10 minutes
      duration: 600,
      status: 'active'
    },
    timestamp: new Date()
  }
});
```

#### **Return Flow Events**

```typescript
// Return pickup required notification to rider
socket.to(`rider:${riderId}`).emit('return:pickup_required', {
  type: 'return_pickup_required',
  data: {
    orderId: 'order123',
    returnedItems: 3,
    message: 'Customer has items to return - please collect them',
    timestamp: new Date()
  }
});

// Return pickup confirmation to rider
socket.emit('return:pickup_confirmed', {
  type: 'return_pickup_confirmed',
  data: {
    orderId: 'order123',
    message: 'Return pickup confirmed. Please head back to store.',
    timestamp: new Date()
  }
});

// Store inspection notification
socket.to(`store:${storeId}`).emit('return:inspect_items', {
  type: 'return_inspect_items',
  data: {
    orderId: 'order123',
    returnedItems: returnedItemsArray,
    message: 'Please inspect returned items for damage',
    timestamp: new Date()
  }
});

// Damaged items report to admin
socket.to('admin:dashboard').emit('return:damaged_items_reported', {
  type: 'return_damaged_items_reported',
  data: {
    orderId: 'order123',
    storeId: 'store456',
    damagedItems: [
      { variantId: 'variant1', reason: 'Torn fabric' },
      { variantId: 'variant2', reason: 'Missing button' }
    ],
    timestamp: new Date()
  }
});
```

### **👂 Backend Listening for Client Events**

```typescript
// Store order response (accept/reject)
socket.on('store:order:response', (data: {
  orderId: string;
  storeId: string;
  accepted: boolean;
  reason?: string;
}) => {
  // Validate store ownership
  // Process acceptance/rejection
  // Update order status
  // Send notifications
});

// Rider offer response (accept/reject)
socket.on('rider:offer:response', (data: {
  offerId: string;
  riderId: string;
  accepted: boolean;
}) => {
  // Validate rider identity
  // Process offer response
  // Update assignment status
  // Notify relevant parties
});

// Rider location updates
socket.on('rider:location:update', (data: {
  orderId: string;
  riderId: string;
  location: {
    latitude: number;
    longitude: number;
  };
}) => {
  // Validate rider identity
  // Update location in database
  // Broadcast to tracking channels
});

// Delivery status updates
socket.on('delivery:status:update', (data: {
  orderId: string;
  riderId: string;
  status: 'picked_up' | 'in_transit' | 'delivered';
  location?: {
    latitude: number;
    longitude: number;
  };
  verificationCode?: string;
}) => {
  // Validate rider identity
  // Update order status
  // Handle verification if needed
  // Send confirmations
});

// Return flow confirmations
socket.on('return:pickup:confirm', (data: {
  orderId: string;
  riderId: string;
  confirmed: boolean;
}) => {
  // Validate rider identity
  // Update return status
  // Transition order status
  // Send confirmations
});

socket.on('return:store:delivery', (data: {
  orderId: string;
  riderId: string;
}) => {
  // Validate rider identity
  // Mark returns delivered to store
  // Transition to inspection phase
});

socket.on('return:inspection:complete', (data: {
  orderId: string;
  storeId: string;
  returnStatus: 'returned_ok' | 'returned_partial' | 'returned_damaged';
  damagedItems?: Array<{
    variantId: string;
    reason: string;
  }>;
}) => {
  // Validate store ownership
  // Process inspection results
  // Finalize order status
  // Handle payment settlement
});
```

## 💻 **Client Code Examples**

### **🔗 Connection & Authentication**

```typescript
import { io, Socket } from 'socket.io-client';

// Initialize connection with JWT authentication
const socket: Socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-jwt-token-here'
  }
});

// Connection event handlers
socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

// Authentication success/failure
socket.on('authenticated', (data) => {
  console.log('Authenticated as:', data.userRole);
});

socket.on('authentication_error', (error) => {
  console.error('Authentication failed:', error.message);
});
```

### **📤 Client Emitting to Backend**

#### **Store Operations**

```typescript
// Store accepting/rejecting order
socket.emit('store:order:response', {
  orderId: 'order123',
  storeId: 'store456',
  accepted: true, // or false
  reason: 'Out of stock' // optional, for rejections
});
```

#### **Rider Operations**

```typescript
// Rider accepting/rejecting delivery offer
socket.emit('rider:offer:response', {
  offerId: 'offer789',
  riderId: 'rider123',
  accepted: true // or false
});

// Rider location update during delivery
socket.emit('rider:location:update', {
  orderId: 'order123',
  riderId: 'rider123',
  location: {
    latitude: 40.7128,
    longitude: -74.0060
  }
});

// Rider status updates
socket.emit('delivery:status:update', {
  orderId: 'order123',
  riderId: 'rider123',
  status: 'picked_up', // or 'in_transit', 'delivered'
  location: {
    latitude: 40.7128,
    longitude: -74.0060
  }
});

// Return flow confirmations
socket.emit('return:pickup:confirm', {
  orderId: 'order123',
  riderId: 'rider123',
  confirmed: true
});

socket.emit('return:store:delivery', {
  orderId: 'order123',
  riderId: 'rider123'
});
```

#### **Store Return Inspection**

```typescript
// Store completing return inspection
socket.emit('return:inspection:complete', {
  orderId: 'order123',
  storeId: 'store456',
  returnStatus: 'returned_damaged', // or 'returned_ok', 'returned_partial'
  damagedItems: [
    {
      variantId: 'variant1',
      reason: 'Torn fabric on sleeve'
    },
    {
      variantId: 'variant2', 
      reason: 'Missing button'
    }
  ]
});
```

### **👂 Client Listening for Backend Events**

#### **Customer Events**

```typescript
// Order status updates
socket.on('order:status_update', (data) => {
  console.log('Order status changed:', data.data.newStatus);
  console.log('Previous status:', data.data.previousStatus);
  console.log('Order details:', data.data.order);
  
  // Update UI based on new status
  updateOrderStatusUI(data.data);
});

// Try period updates
socket.on('try_period:update', (data) => {
  console.log('Try period update:', data.data.type);
  
  switch (data.data.type) {
    case 'try_period_started':
      startTryPeriodTimer(data.data.tryPeriod);
      break;
    case 'try_period_expired':
      showExpiredNotification();
      break;
    case 'try_period_finalized':
      showFinalizationResult(data.data);
      break;
  }
});

// Return flow updates
socket.on('return:rider_coming', (data) => {
  console.log('Rider coming for pickup:', data.data.message);
  showRiderComingNotification(data.data);
});
```

#### **Rider Events**

```typescript
// Delivery offers
socket.on('rider:offer', (data) => {
  console.log('New delivery offer received:', data.data);
  
  // Show offer UI with timeout
  showDeliveryOffer({
    orderId: data.data.orderId,
    timeout: data.data.timeout,
    storeInfo: data.data.storeInfo,
    orderItems: data.data.orderItems
  });
});

// Assignment confirmations
socket.on('order:assignment_confirmed', (data) => {
  console.log('Order assigned:', data.data.orderId);
  console.log('Store location:', data.data.storeInfo);
  
  // Navigate to delivery screen
  startDeliveryMode(data.data);
});

// Return pickup requests
socket.on('return:pickup_required', (data) => {
  console.log('Return pickup needed:', data.data);
  
  // Show return pickup notification
  showReturnPickupRequest({
    orderId: data.data.orderId,
    itemCount: data.data.returnedItems
  });
});

// Return pickup confirmation
socket.on('return:pickup_confirmed', (data) => {
  console.log('Return pickup confirmed:', data.data.message);
  showSuccessMessage(data.data.message);
});
```

#### **Store/Merchant Events**

```typescript
// New orders
socket.on('order:new', (data) => {
  console.log('New order received:', data.data);
  
  // Show new order notification
  showNewOrderNotification({
    order: data.data.order,
    customer: data.data.customer,
    items: data.data.orderItems
  });
});

// Order response confirmations
socket.on('order:response_confirmed', (data) => {
  console.log('Response confirmed:', data.data);
  showResponseConfirmation(data.data);
});

// Return inspections
socket.on('return:inspect_items', (data) => {
  console.log('Items to inspect:', data.data.returnedItems);
  
  // Show inspection interface
  showReturnInspectionUI(data.data);
});

// Rider returning notifications
socket.on('return:rider_returning', (data) => {
  console.log('Rider returning with items:', data.data);
  showRiderReturningNotification(data.data);
});
```

#### **Admin Events**

```typescript
// Order assignment issues
socket.on('order:assignment_issue', (data) => {
  console.log('Assignment issue:', data.data);
  
  // Show urgent notification
  showUrgentAlert({
    priority: data.priority,
    orderId: data.data.orderId,
    message: data.data.message
  });
});

// Damaged items reports
socket.on('return:damaged_items_reported', (data) => {
  console.log('Damaged items reported:', data.data);
  
  // Add to damage reports list
  addDamageReport({
    orderId: data.data.orderId,
    storeId: data.data.storeId,
    items: data.data.damagedItems
  });
});

// System monitoring events
socket.on('return:inspection_started', (data) => {
  console.log('Inspection started:', data.data);
  updateInspectionDashboard(data.data);
});
```

### **🔧 Error Handling**

```typescript
// General error handling
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
  showErrorNotification(error.message);
});

// Connection issues
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
  showConnectionError();
});

// Reconnection handling
socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
  showReconnectionSuccess();
});

socket.on('reconnect_failed', () => {
  console.error('Failed to reconnect');
  showReconnectionFailure();
});
```

### **📋 Channel Management (If Implemented)**

```typescript
// Manual order channel joining
socket.emit('join-order', {
  orderId: 'order123'
});

// Listen for join confirmation
socket.on('order:channel_joined', (data) => {
  console.log('Successfully joined order channel:', data.data.orderId);
});

// Leave order channel
socket.emit('leave-order', {
  orderId: 'order123'
});

socket.on('order:channel_left', (data) => {
  console.log('Left order channel:', data.data.orderId);
});
```

## 📚 **Usage Patterns**

### **Typical Client Integration**

```typescript
class EasyFitSocket {
  private socket: Socket;

  constructor(token: string) {
    this.socket = io('ws://localhost:3000', {
      auth: { token }
    });
    
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Connection events
    this.socket.on('connect', () => this.onConnect());
    this.socket.on('disconnect', () => this.onDisconnect());
    
    // Order events
    this.socket.on('order:status_update', (data) => this.onOrderUpdate(data));
    this.socket.on('try_period:update', (data) => this.onTryPeriodUpdate(data));
    
    // Role-specific events
    if (this.userRole === 'rider') {
      this.socket.on('rider:offer', (data) => this.onDeliveryOffer(data));
      this.socket.on('return:pickup_required', (data) => this.onReturnPickup(data));
    }
  }

  // Emit methods
  public acceptOrder(orderId: string) {
    this.socket.emit('store:order:response', {
      orderId,
      storeId: this.storeId,
      accepted: true
    });
  }

  public updateLocation(orderId: string, location: { lat: number, lng: number }) {
    this.socket.emit('rider:location:update', {
      orderId,
      riderId: this.riderId,
      location: { latitude: location.lat, longitude: location.lng }
    });
  }
}
```

This provides copy-paste ready code examples for implementing WebSocket functionality in the EasyFit system! 🚀