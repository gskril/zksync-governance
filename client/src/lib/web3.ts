import { createConfig, http } from 'wagmi'
import { zksync, mainnet } from 'wagmi/chains'

export const wagmiConfig = createConfig({
  chains: [zksync, mainnet],
  transports: {
    [zksync.id]: http(import.meta.env.VITE_ZKSYNC_RPC_URL),
    [mainnet.id]: http(import.meta.env.VITE_ETH_RPC_URL),
  },
})
