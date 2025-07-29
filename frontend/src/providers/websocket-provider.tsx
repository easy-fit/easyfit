'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { webSocketClient, WebSocketConnectionStatus } from '@/lib/websocket/websocket-client';
import { useAuth } from '@/hooks/use-auth';

interface WebSocketContextType {
  connectionStatus: WebSocketConnectionStatus;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<WebSocketConnectionStatus>('disconnected');

  // Connect to WebSocket
  const connect = React.useCallback(() => {
    if (isAuthenticated) {
      // Using HTTP-only cookies - Socket.IO will automatically send cookies with the connection
      webSocketClient.connect();
    }
  }, [isAuthenticated]);

  // Disconnect from WebSocket
  const disconnect = () => {
    webSocketClient.disconnect();
  };

  // Monitor connection status changes
  useEffect(() => {
    const checkStatus = () => {
      setConnectionStatus(webSocketClient.getConnectionStatus());
    };

    // Check status every second when not connected
    const interval = setInterval(checkStatus, 1000);

    // Cleanup interval
    return () => clearInterval(interval);
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // User is authenticated, connect to WebSocket
      connect();
    } else {
      // User is not authenticated, disconnect
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      webSocketClient.removeAllListeners();
      disconnect();
    };
  }, [isAuthenticated, user, connect]);

  const value: WebSocketContextType = {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    connect,
    disconnect,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocketContext(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}
