import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const queryKeys = {
  instruments: ['instruments'] as const,
  instrument: (id: number) => ['instrument', id] as const,
  transactions: (instrumentId: number) => ['transactions', instrumentId] as const,
  allTransactions: ['transactions', 'all'] as const,
  summary: ['summary'] as const,
};
