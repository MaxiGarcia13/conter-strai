import { QueryClient } from '@tanstack/react-query';
import { shouldRetryLobbyQuery } from './should-retry-lobby-query';

export function createLobbyQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryLobbyQuery,
        staleTime: 0,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
