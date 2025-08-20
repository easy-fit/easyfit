import { useCallback, useEffect } from 'react';
import { webSocketClient } from '@/lib/websocket/websocket-client';
import { useWebSocketContext } from '@/providers/websocket-provider';
import type { StoreOrderResponse, StoreInspectionResult } from '@/types/websockets';

export interface UseWebSocketReturn {
  // Connection status
  isConnected: boolean;
  connectionStatus: string;

  // Generic methods
  on: <T = unknown>(event: string, callback: (data: T) => void) => void;
  off: <T = unknown>(event: string, callback: (data: T) => void) => void;
  emit: (event: string, data?: unknown) => void;

  // Customer methods
  joinOrder: (orderId: string) => void;
  leaveOrder: (orderId: string) => void;

  // Merchant methods
  respondToOrder: (response: StoreOrderResponse) => void;
  completeReturnInspection: (inspection: StoreInspectionResult) => void;
  joinStoreChannel: (storeId: string) => void;
  leaveStoreChannel: (storeId: string) => void;

  // Connection methods
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const { connectionStatus, isConnected, connect, disconnect } = useWebSocketContext();

  // Generic event listener with cleanup
  const on = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
    webSocketClient.on(event, callback);
  }, []);

  // Generic event listener removal
  const off = useCallback(<T = unknown>(event: string, callback: (data: T) => void) => {
    webSocketClient.off(event, callback);
  }, []);

  // Generic event emitter
  const emit = useCallback((event: string, data?: unknown) => {
    webSocketClient.emit(event, data);
  }, []);

  // Customer methods
  const joinOrder = useCallback((orderId: string) => {
    webSocketClient.joinOrder(orderId);
  }, []);

  const leaveOrder = useCallback((orderId: string) => {
    webSocketClient.leaveOrder(orderId);
  }, []);

  // Merchant methods
  const respondToOrder = useCallback((response: StoreOrderResponse) => {
    webSocketClient.respondToOrder(response);
  }, []);

  const completeReturnInspection = useCallback((inspection: StoreInspectionResult) => {
    webSocketClient.completeReturnInspection(inspection);
  }, []);

  const joinStoreChannel = useCallback((storeId: string) => {
    webSocketClient.joinStoreChannel(storeId);
  }, []);

  const leaveStoreChannel = useCallback((storeId: string) => {
    webSocketClient.leaveStoreChannel(storeId);
  }, []);

  return {
    // Connection status
    isConnected,
    connectionStatus,

    // Generic methods
    on,
    off,
    emit,

    // Customer methods
    joinOrder,
    leaveOrder,

    // Merchant methods
    respondToOrder,
    completeReturnInspection,
    joinStoreChannel,
    leaveStoreChannel,

    // Connection methods
    connect,
    disconnect,
  };
}

// Convenience hook for order tracking (customers)
export function useOrderTracking(orderId: string) {
  const { joinOrder, leaveOrder, on, off } = useWebSocket();

  useEffect(() => {
    // Join order channel on mount
    joinOrder(orderId);

    // Leave order channel on unmount
    return () => {
      leaveOrder(orderId);
    };
  }, [orderId, joinOrder, leaveOrder]);

  // Helper to subscribe to order events
  const onOrderEvent = useCallback(
    <T = unknown>(event: string, callback: (data: T) => void) => {
      on(event, callback);

      // Return cleanup function
      return () => off(event, callback);
    },
    [on, off],
  );

  return {
    onOrderEvent,
  };
}

// Convenience hook for merchant store events
export function useStoreEvents() {
  const { on, off, respondToOrder, completeReturnInspection, joinStoreChannel, leaveStoreChannel } = useWebSocket();

  // Helper to subscribe to store events
  const onStoreEvent = useCallback(
    <T = unknown>(event: string, callback: (data: T) => void) => {
      on(event, callback);

      // Return cleanup function
      return () => off(event, callback);
    },
    [on, off],
  );

  return {
    onStoreEvent,
    respondToOrder,
    completeReturnInspection,
    joinStoreChannel,
    leaveStoreChannel,
  };
}

// Convenience hook for admin events
export function useAdminEvents() {
  const { on, off } = useWebSocket();

  // Helper to subscribe to admin events
  const onAdminEvent = useCallback(
    <T = unknown>(event: string, callback: (data: T) => void) => {
      on(event, callback);

      // Return cleanup function
      return () => off(event, callback);
    },
    [on, off],
  );

  return {
    onAdminEvent,
  };
}
