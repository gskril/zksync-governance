import { createConfig, http } from 'wagmi'
import { zksync, mainnet } from 'wagmi/chains'
import { env } from './env'

export const wagmiConfig = createConfig({
  chains: [zksync, mainnet],
  transports: {
    [zksync.id]: http(env.ZKSYNC_RPC_URL),
    [mainnet.id]: http(env.ETH_RPC_URL),
  },
})
