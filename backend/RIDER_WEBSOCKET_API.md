# Rider WebSocket API Documentation

This document outlines all WebSocket events that involve riders in the EasyFit delivery system, organized by delivery flow order.

## Connection & Authentication

Riders must connect to the WebSocket server with proper authentication. Upon connection, riders automatically join the `rider:${riderId}` channel.

**Required Authentication**: JWT token with `rider` role

---

## 1. RIDER AVAILABILITY MANAGEMENT

### 🔄 Rider Goes Online/Offline

**Event**: `rider:availability:toggle`  
**Direction**: FROM Rider → TO Backend  
**Purpose**: Toggle rider availability for receiving delivery offers

```javascript
// Rider sends
socket.emit('rider:availability:toggle', {
  riderId: 'rider_id_here',
  isAvailable: true, // or false
  location: {
    latitude: -34.6037,
    longitude: -58.3816,
  },
  timestamp: new Date(),
});
```

**Backend Response**: `rider:availability_confirmed`

```javascript
// Rider receives
{
  type: 'rider_availability_confirmed',
  data: {
    riderId: 'rider_id_here',
    isAvailable: true,
    timestamp: '2024-01-01T10:00:00Z'
  }
}
```

### 📍 Location Updates (While Available)

**Event**: `rider:location:tracking`  
**Direction**: FROM Rider → TO Backend  
**Purpose**: Continuous location updates while rider is available

```javascript
// Rider sends
socket.emit('rider:location:tracking', {
  riderId: 'rider_id_here',
  location: {
    latitude: -34.6037,
    longitude: -58.3816,
  },
  timestamp: new Date(),
});
```

**Backend Response**: `rider:location_confirmed`

```javascript
// Rider receives
{
  type: 'rider_location_confirmed',
  data: {
    riderId: 'rider_id_here',
    timestamp: '2024-01-01T10:00:00Z'
  }
}
```

---

## 2. ORDER ASSIGNMENT FLOW

### 📦 Delivery Offer Received

**Event**: `rider:offer`  
**Direction**: FROM Backend → TO Rider  
**Purpose**: System sends delivery offer to available riders (30 second timeout)

```javascript
// Rider receives
{
  type: 'delivery_offer',
  data: {
    order: {
      _id: 'order_id_here',
      shipping: {
        type: 'premium', // 'simple', 'advanced', 'premium'
        address: {
          formatted: {
            street: 'Mitre',
            streetNumber: '1097',
            apartment: '4B', // optional
            floor: '3', // optional
            building: 'Torre A' // optional
          }
        },
        distance: 1.5, // km
        cost: 2844,
        tryOnEnabled: true
      }
    },
    storeInfo: {
      name: 'Tienda Deportiva',
      address: {
        formatted: {
          street: 'Corrientes',
          streetNumber: '1234'
        }
      }
    },
    riderId: 'rider_id_here',
    timeout: 30000, // 30 seconds
    timestamp: '2024-01-01T10:00:00Z'
  },
  offerId: 'unique_offer_id'
}
```

### ✅ Accept/Reject Delivery Offer

**Event**: `rider:offer:response`  
**Direction**: FROM Rider → TO Backend  
**Purpose**: Rider accepts or rejects the delivery offer

```javascript
// Rider sends
socket.emit('rider:offer:response', {
  orderId: 'order_id_here',
  riderId: 'rider_id_here',
  accepted: true, // or false
  timestamp: new Date(),
  reason: 'Optional rejection reason', // only if accepted: false
});
```

### 🎯 Assignment Confirmation

**Event**: `order:assignment_confirmed`  
**Direction**: FROM Backend → TO Rider  
**Purpose**: Confirms rider has been assigned with complete order details

```javascript
// Rider receives
{
  type: 'assignment_confirmed',
  data: {
    order: {
      orderId: 'order_id_here',
      status: 'rider_assigned'
    },
    customer: {
      name: 'maría',
      surname: 'gonzález'
    },
    storeInfo: {
      name: 'Tienda Deportiva',
      address: {
        formatted: {
          street: 'Corrientes',
          streetNumber: '1234'
        },
        location: {
          latitude: -34.6037,
          longitude: -58.3816
        },
      },
    },
    shipping: {
      address: {
        formatted: {
          street: 'Mitre',
          streetNumber: '1097',
          apartment: '4B',
          floor: '3',
          building: 'Torre A'
        }
      },
      cost: 2844,
      type: 'premium'
    },
    timestamp: '2024-01-01T10:00:00Z'
  }
}
```

---

## 3. DELIVERY EXECUTION

### 📍 Location Updates (During Delivery)

**Event**: `rider:location:update`  
**Direction**: FROM Rider → TO Backend  
**Purpose**: Track rider location during active delivery

```javascript
// Rider sends
socket.emit('rider:location:update', {
  orderId: 'order_id_here',
  riderId: 'rider_id_here',
  location: {
    latitude: -34.6037,
    longitude: -58.3816,
  },
  timestamp: new Date(),
});
```

**Backend Response**: `delivery:location_confirmed`

```javascript
// Rider receives
{
  type: 'location_confirmed',
  timestamp: '2024-01-01T10:00:00Z'
}
```

### 📦 Pickup from Store

**Event**: `delivery:status:update`  
**Direction**: FROM Rider → TO Backend  
**Purpose**: Confirm rider picked up items from store

```javascript
// Rider sends
socket.emit('delivery:status:update', {
  orderId: 'order_id_here',
  riderId: 'rider_id_here',
  status: 'picked_up',
  location: {
    // optional
    latitude: -34.6037,
    longitude: -58.3816,
  },
  timestamp: new Date(),
});
```

**Backend Response**: `delivery:status_confirmed`

```javascript
// Rider receives
{
  type: 'status_confirmed',
  data: {
    orderId: 'order_id_here',
    riderId: 'rider_id_here',
    status: 'picked_up',
    timestamp: '2024-01-01T10:00:00Z'
  }
}
```

**Note**: Order status automatically becomes `in_transit` after pickup confirmation.

---

## 4. DELIVERY COMPLETION

### 🏠 Delivery Verification

**Note**: Final delivery is NOT handled via WebSocket. Riders must use the HTTP endpoint:

```http
POST /api/v1/orders/:orderId/verify-delivery
Content-Type: application/json
Authorization: Bearer {rider_jwt_token}

{
  "code": "123456",
  "riderId": "rider_id_here"
}
```

This transitions the order to `delivered` status and may trigger try period for advanced/premium shipping.

---

## 5. TRY PERIOD FLOW (Advanced/Premium Shipping Only)

### ⏰ Try Period Started

**Event**: `try_period:update`  
**Direction**: FROM Backend → TO Rider  
**Purpose**: Notifies rider that customer's try period has started

```javascript
// Rider receives
{
  type: 'try_period_update',
  data: {
    orderId: 'order_id_here',
    type: 'try_period_started',
    tryPeriod: {
      isActive: true,
      startedAt: '2024-01-01T17:00:00Z',
      endsAt: '2024-01-01T17:17:00Z', // 17 minutes for premium
      duration: 1020, // seconds
      status: 'active',
      exceededTime: 0
    },
    timestamp: '2024-01-01T17:00:00Z'
  }
}
```

### 📋 Customer Decisions Completed

**Event**: `customer:decisions_completed`  
**Direction**: FROM Backend → TO Rider  
**Purpose**: Customer has decided what to keep/return - includes detailed item breakdown

```javascript
// Rider receives
{
  type: 'customer_decisions_completed',
  data: {
    orderId: 'order_id_here',
    customer: {
      name: 'maría',
      surname: 'gonzález'
    },
    summary: {
      keepCount: 2,
      returnCount: 2,
      totalItems: 4,
      status: 'completed'
    },
    items: [
      {
        _id: 'item_id_1',
        productName: 'Crop Top',
        variantInfo: 'XL',
        quantity: 1,
        decision: 'keep',
        decisionLabel: 'Se queda',
        image: {
          key: 'products/variant/image1.jpg',
          altText: 'Crop Top'
        }
      },
      {
        _id: 'item_id_2',
        productName: 'Pointed-collar Top',
        variantInfo: 'M',
        quantity: 1,
        decision: 'return',
        decisionLabel: 'Devuelve',
        image: {
          key: 'products/variant/image2.jpg',
          altText: 'Pointed-collar Top'
        }
      }
    ],
    timestamp: '2024-01-01T17:10:00Z'
  }
}
```

---

## 6. RETURN PICKUP FLOW (If Customer Has Returns)

### 🏠 Confirm Return Pickup from Customer

**Event**: `rider:confirm_return_pickup`  
**Direction**: FROM Rider → TO Backend  
**Purpose**: Rider confirms they collected returned items from customer

```javascript
// Rider sends
socket.emit('rider:confirm_return_pickup', {
  orderId: 'order_id_here',
  riderId: 'rider_id_here',
  confirmed: true,
});
```

**Backend Response**: `return:pickup_confirmed`

```javascript
// Rider receives
{
  type: 'return_pickup_confirmed',
  data: {
    orderId: 'order_id_here',
    store: {
      name: 'Tienda Deportiva',
      address: {
        formatted: {
          street: 'Corrientes',
          streetNumber: '1234',
          city: 'CABA'
        },
        coordinates: {
          -34.6037,
          -58.3816
        },
      }
    },
    returnItems: [
      {
        _id: 'item_id_2',
        productName: 'Pointed-collar Top',
        variantInfo: 'M',
        quantity: 1,
        image: {
          key: 'products/variant/image2.jpg',
          altText: 'Pointed-collar Top'
        }
      }
    ],
    returnCount: 2,
    timestamp: '2024-01-01T17:15:00Z'
  }
}
```

### 🏪 Confirm Return Delivery to Store

**Event**: `return:store:delivery`  
**Direction**: FROM Rider → TO Backend  
**Purpose**: Rider confirms they delivered returned items back to store

```javascript
// Rider sends
socket.emit('return:store:delivery', {
  orderId: 'order_id_here',
  riderId: 'rider_id_here',
});
```

**Backend Response**: `return:store_delivery_confirmed`

```javascript
// Rider receives
{
  type: 'return_store_delivery_confirmed',
  data: {
    orderId: 'order_id_here',
    message: 'Returns delivered to store successfully.',
    timestamp: '2024-01-01T17:25:00Z'
  }
}
```

**Note**: After this, rider waits for store to inspect items. Rider will receive final payment when store approves.

---

## 7. ORDER COMPLETION & PAYMENT

### 💰 Order Completed & Payment

**Event**: `order:completed`  
**Direction**: FROM Backend → TO Rider  
**Purpose**: Order is fully completed, rider receives payment details

```javascript
// Rider receives
{
  type: 'order_completed',
  data: {
    order: {
      id: 'order_id_here',
      status: 'purchased', // or 'returned_ok', 'returned_partial'
      shipping: {
        type: 'premium',
        total: 2844
      },
      store: 'Tienda Deportiva'
    },
    message: 'Delivery completed successfully! You are now available for new orders.',
    timestamp: '2024-01-01T17:30:00Z'
  }
}
```

**Note**: Rider is automatically set to available again and can receive new offers.

---

## 8. ORDER CANCELLATION (Emergency Only)

### ❌ Cancel Assigned Order

**Event**: `rider:order:cancel`  
**Direction**: FROM Rider → TO Backend  
**Purpose**: Cancel order before pickup (emergency only)

```javascript
// Rider sends
socket.emit('rider:order:cancel', {
  orderId: 'order_id_here',
  riderId: 'rider_id_here',
  reason: 'Vehicle breakdown', // optional
  timestamp: new Date(),
});
```

**Backend Response**: `rider:cancellation_confirmed`

```javascript
// Rider receives
{
  type: 'rider_cancellation_confirmed',
  data: {
    orderId: 'order_id_here',
    message: 'Order cancellation confirmed.',
    timestamp: '2024-01-01T10:30:00Z'
  }
}
```

**Note**: Order is reassigned to another rider. Use sparingly as it affects rider rating.

---

## Error Handling

All events include comprehensive error handling. If an error occurs, riders receive:

```javascript
{
  type: 'error',
  message: 'Error description here'
}
```

Common error scenarios:

- **Unauthorized**: Wrong rider role or riderId mismatch
- **Invalid Order State**: Attempting invalid status transitions
- **Timeout**: Offer response took too long
- **Validation**: Missing required fields

---

## Complete Delivery Flow Summary

1. **Rider goes online** → `rider:availability:toggle`
2. **Receives delivery offer** ← `rider:offer`
3. **Accepts offer** → `rider:offer:response`
4. **Gets assignment details** ← `order:assignment_confirmed`
5. **Updates location while traveling** → `rider:location:update`
6. **Confirms pickup from store** → `delivery:status:update` (picked_up)
7. **Continues location updates to customer** → `rider:location:update`
8. **Confirms delivery** → HTTP POST to `/verify-delivery`
9. **If try period:** Receives customer decisions ← `customer:decisions_completed`
10. **If returns:** Confirms return pickup → `rider:confirm_return_pickup`
11. **Returns to store** → `return:store:delivery`
12. **Gets final payment** ← `order:completed`

---

## Technical Notes

- **Channel**: Riders join `rider:${riderId}` channel automatically
- **Authentication**: JWT required with `rider` role
- **Rate Limiting**: Location updates should be throttled client-side
- **Reconnection**: Handle reconnection gracefully, rejoin channels
- **Error Recovery**: Implement retry logic for critical events
- **Offline Handling**: Queue events when connection is lost

---

## Development Tips

1. **Test with Mock Data**: Use order IDs from your test database
2. **Handle Timeouts**: Implement UI timeouts for offer responses
3. **Location Permissions**: Request precise location permissions
4. **Battery Optimization**: Implement smart location update intervals
5. **Push Notifications**: Consider fallback push notifications for critical events
6. **State Management**: Maintain rider state (available, assigned, delivering, etc.)
