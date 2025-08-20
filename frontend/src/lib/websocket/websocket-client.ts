import { io, Socket } from 'socket.io-client';
import { ENV } from '@/config/env';
import type {
  CustomerJoinOrder,
  CustomerLeaveOrder,
  StoreOrderResponse,
  StoreInspectionResult,
  MerchantJoinStore,
  MerchantLeaveStore,
} from '@/types/websockets';

export type WebSocketConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export class WebSocketClient {
  private socket: Socket | null = null;
  private connectionStatus: WebSocketConnectionStatus = 'disconnected';
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();
  private callbackMap: Map<string, Map<(...args: unknown[]) => void, (...args: unknown[]) => void>> = new Map();

  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  connect(_token?: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.connectionStatus = 'connecting';

    this.socket = io(ENV.SOCKET_URL, {
      withCredentials: true, // This ensures HTTP-only cookies are sent with the request
      transports: ['websocket', 'polling'],
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connectionStatus = 'connected';
      this.reRegisterListeners();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.connectionStatus = 'disconnected';
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.connectionStatus = 'error';
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus = 'disconnected';
    }
  }

  getConnectionStatus(): WebSocketConnectionStatus {
    return this.connectionStatus;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // Generic event listener
  on<T = unknown>(event: string, callback: (data: T) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
      this.callbackMap.set(event, new Map());
    }

    const wrappedCallback = (...args: unknown[]) => callback(args[0] as T);
    const typedCallback = callback as (...args: unknown[]) => void;

    this.listeners.get(event)!.add(wrappedCallback);
    this.callbackMap.get(event)!.set(typedCallback, wrappedCallback);

    if (this.socket?.connected) {
      this.socket.on(event, wrappedCallback);
    }
  }

  off<T = unknown>(event: string, callback: (data: T) => void): void {
    const eventListeners = this.listeners.get(event);
    const eventCallbackMap = this.callbackMap.get(event);
    const typedCallback = callback as (...args: unknown[]) => void;

    if (eventListeners && eventCallbackMap) {
      const wrappedCallback = eventCallbackMap.get(typedCallback);
      if (wrappedCallback) {
        eventListeners.delete(wrappedCallback);
        eventCallbackMap.delete(typedCallback);

        // Remove from socket if connected
        if (this.socket) {
          this.socket.off(event, wrappedCallback);
        }
      }
    }
  }

  emit(event: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Cannot emit event "${event}": WebSocket not connected`);
    }
  }

  joinOrder(orderId: string): void {
    this.emit('customer:join:order', { orderId } as CustomerJoinOrder);
  }

  leaveOrder(orderId: string): void {
    this.emit('customer:leave:order', { orderId } as CustomerLeaveOrder);
  }

  // Merchant-specific methods
  respondToOrder(response: StoreOrderResponse): void {
    this.emit('store:order:response', response);
  }

  completeReturnInspection(inspection: StoreInspectionResult): void {
    this.emit('return:inspection:complete', inspection);
  }

  // Store-specific channel management for merchants with multiple stores
  joinStoreChannel(storeId: string): void {
    if (this.socket?.connected) {
      this.emit('merchant:join:store', { storeId } as MerchantJoinStore);
    }
  }

  leaveStoreChannel(storeId: string): void {
    if (this.socket?.connected) {
      this.emit('merchant:leave:store', { storeId } as MerchantLeaveStore);
    }
  }

  // Re-register all listeners after reconnection
  private reRegisterListeners(): void {
    if (!this.socket?.connected) return;

    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket!.on(event, callback);
      });
    });
  }

  removeAllListeners(): void {
    this.listeners.clear();
    this.callbackMap.clear();
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Singleton instance
export const webSocketClient = new WebSocketClient();
