'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * QueryProvider - React Query Provider for deCentra
 *
 * Provides React Query functionality across the application with:
 * - Optimized caching configuration
 * - Development tools integration
 * - Error boundaries and retry logic
 * - Background refetching for real-time experience
 */

interface QueryProviderProps {
  children: React.ReactNode;
}

// Query client configuration optimized for social media
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  });

export function QueryProvider({ children }: QueryProviderProps) {
  // Create a stable QueryClient instance to prevent unnecessary re-renders
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
