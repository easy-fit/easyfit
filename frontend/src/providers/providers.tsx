'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './auth-provider';
import { WebSocketProvider } from './websocket-provider';
import { ReactNode, useState } from 'react';
import { ENV } from '@/config/env';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Create a new QueryClient instance for each mount to avoid shared state
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error: unknown) => {
              // Don't retry on 401/403 errors (auth issues)
              const err = error as { status?: number };
              if (err?.status === 401 || err?.status === 403) {
                return false;
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
          },
          mutations: {
            retry: false, // Don't retry mutations by default
          },
        },
      }),
  );

  return (
    <GoogleOAuthProvider clientId={ENV.GOOGLE_OAUTH_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
