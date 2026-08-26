import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createLobbyQueryClient } from '../utils/create-lobby-query-client';

interface LobbyQueryProviderProps {
  children: ReactNode;
}

export function LobbyQueryProvider({ children }: LobbyQueryProviderProps) {
  const [queryClient] = useState(createLobbyQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
