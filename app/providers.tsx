"use client"

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/config';
import { AppEnvironment } from '@/hooks/useApp';
import useApp from '@/hooks/useApp';
import { LocationProvider } from '@/contexts/LocationContext';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const appState = useApp();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <LocationProvider>
          <AppEnvironment.Provider value={appState}>
            {children}
          </AppEnvironment.Provider>
        </LocationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}