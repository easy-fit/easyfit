import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket, SocketChannels } from '../types/websocket.types';
import { socketAuthMiddleware } from './middleware/auth.middleware';
import { OrderNotificationHandler } from './handlers/orderNotification.handler';
import { RiderOfferHandler } from './handlers/riderOffer.handler';
import { DeliveryTrackingHandler } from './handlers/deliveryTracking.handler';
import { TryPeriodHandler } from './handlers/tryPeriod.handler';
import { ReturnFlowHandler } from './handlers/returnFlow.handler';
import { RiderAvailabilityHandler } from './handlers/riderAvailability.handler';
import { RiderCancellationHandler } from './handlers/riderCancellation.handler';

export class WebSocketOrchestrator {
  private io: SocketIOServer;
  private orderNotificationHandler: OrderNotificationHandler;
  private riderOfferHandler: RiderOfferHandler;
  private deliveryTrackingHandler: DeliveryTrackingHandler;
  private tryPeriodHandler: TryPeriodHandler;
  private returnFlowHandler: ReturnFlowHandler;
  private riderAvailabilityHandler: RiderAvailabilityHandler;
  private riderCancellationHandler: RiderCancellationHandler;

  // Channel naming conventions
  public readonly CHANNELS: SocketChannels = {
    STORE: (storeId: string) => `store:${storeId}`,
    RIDER: (riderId: string) => `rider:${riderId}`,
    ORDER: (orderId: string) => `order:${orderId}`,
    ADMIN_DASHBOARD: 'admin:dashboard',
  };

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Initialize handlers
    this.orderNotificationHandler = new OrderNotificationHandler(this.io, this.CHANNELS);
    this.riderOfferHandler = new RiderOfferHandler(this.io, this.CHANNELS);
    this.deliveryTrackingHandler = new DeliveryTrackingHandler(this.io, this.CHANNELS);
    this.tryPeriodHandler = new TryPeriodHandler(this.io, this.CHANNELS);
    this.returnFlowHandler = new ReturnFlowHandler(this.io, this.CHANNELS);
    this.riderAvailabilityHandler = new RiderAvailabilityHandler(this.io, this.CHANNELS);
    this.riderCancellationHandler = new RiderCancellationHandler(this.io, this.CHANNELS);

    this.setupMiddleware();
    this.setupConnectionHandling();
  }

  private setupMiddleware(): void {
    this.io.use(socketAuthMiddleware);
  }

  private setupConnectionHandling(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.userId} (${socket.userRole})`);

      this.handleRoleBasedChannels(socket);

      this.setupSocketEventHandlers(socket);

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
      });
    });
  }

  private handleRoleBasedChannels(socket: AuthenticatedSocket): void {
    if (!socket.userRole || !socket.userId) return;

    switch (socket.userRole) {
      case 'merchant':
        if (socket.storeId) {
          socket.join(this.CHANNELS.STORE(socket.storeId));
          console.log(`Merchant ${socket.userId} joined store channel: ${socket.storeId}`);
        }
        break;

      case 'rider':
        socket.join(this.CHANNELS.RIDER(socket.userId));
        console.log(`Rider ${socket.userId} joined rider channel`);
        break;

      case 'admin':
        socket.join(this.CHANNELS.ADMIN_DASHBOARD);
        console.log(`Admin ${socket.userId} joined admin dashboard`);
        break;

      case 'customer':
        // Customers join order-specific channels when they place orders
        console.log(`Customer ${socket.userId} connected`);
        break;
    }
  }

  private setupSocketEventHandlers(socket: AuthenticatedSocket): void {
    // Store order response (accept/reject)
    socket.on('store:order:response', (data) => {
      this.orderNotificationHandler.handleStoreResponse(socket, data);
    });

    // Rider offer response (accept/reject)
    socket.on('rider:offer:response', (data) => {
      this.riderOfferHandler.handleRiderResponse(socket, data);
    });

    // Delivery status updates
    socket.on('delivery:status:update', (data) => {
      this.deliveryTrackingHandler.handleStatusUpdate(socket, data);
    });

    // Location updates from riders
    socket.on('rider:location:update', (data) => {
      this.deliveryTrackingHandler.handleLocationUpdate(socket, data);
    });

    // Return flow events
    socket.on('return:pickup:confirm', (data) => {
      this.returnFlowHandler.handleReturnPickupConfirmation(socket, data);
    });

    socket.on('return:store:delivery', (data) => {
      this.returnFlowHandler.handleStoreReturnDelivery(socket, data);
    });

    socket.on('return:inspection:complete', (data) => {
      this.returnFlowHandler.handleStoreInspectionResult(socket, data);
    });

    // Rider availability events
    socket.on('rider:availability:toggle', (data) => {
      this.riderAvailabilityHandler.handleAvailabilityToggle(socket, data);
    });

    socket.on('rider:location:tracking', (data) => {
      this.riderAvailabilityHandler.handleLocationUpdate(socket, data);
    });

    // Rider cancellation events
    socket.on('rider:order:cancel', (data) => {
      this.riderCancellationHandler.handleRiderCancellation(socket, data);
    });

    // Rider return confirmation events
    socket.on('rider:confirm_return_pickup', (data) => {
      this.returnFlowHandler.handleReturnPickupConfirmation(socket, data);
    });

    // Customer order channel management
    socket.on('customer:join:order', (data) => {
      this.orderNotificationHandler.handleCustomerJoinOrder(socket, data);
    });

    socket.on('customer:leave:order', (data) => {
      this.orderNotificationHandler.handleCustomerLeaveOrder(socket, data);
    });
  }

  // Public methods for emitting events from services
  public getOrderNotificationHandler(): OrderNotificationHandler {
    return this.orderNotificationHandler;
  }

  public getRiderOfferHandler(): RiderOfferHandler {
    return this.riderOfferHandler;
  }

  public getDeliveryTrackingHandler(): DeliveryTrackingHandler {
    return this.deliveryTrackingHandler;
  }

  public getTryPeriodHandler(): TryPeriodHandler {
    return this.tryPeriodHandler;
  }

  public getReturnFlowHandler(): ReturnFlowHandler {
    return this.returnFlowHandler;
  }

  public getRiderAvailabilityHandler(): RiderAvailabilityHandler {
    return this.riderAvailabilityHandler;
  }

  public getRiderCancellationHandler(): RiderCancellationHandler {
    return this.riderCancellationHandler;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}
