'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/lib/web3'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

const queryClient = new QueryClient()

export function ClientProviders({ children }: React.PropsWithChildren) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
