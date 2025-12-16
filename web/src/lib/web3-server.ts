import { createConfig, http } from 'wagmi'
import { mainnet, zksync } from 'wagmi/chains'

import { env } from './env'

export const chains = [zksync, mainnet] as const
export const transports = {
  [zksync.id]: http(env.ZKSYNC_RPC_URL),
  [mainnet.id]: http(env.ETH_RPC_URL, {
    batch: {
      batchSize: 1_024,
    },
  }),
}

export const wagmiConfigForServer = createConfig({
  chains,
  transports,
})
