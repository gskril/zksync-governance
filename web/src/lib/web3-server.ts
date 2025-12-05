import { createConfig, http } from 'wagmi'
import { zksync, mainnet, zksyncSepoliaTestnet } from 'wagmi/chains'
import { env } from './env'

export const chains = [zksync, zksyncSepoliaTestnet, mainnet] as const
export const transports = {
  [zksync.id]: http(env.ZKSYNC_RPC_URL),
  [zksyncSepoliaTestnet.id]: http('https://zksync-sepolia.drpc.org'),
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
