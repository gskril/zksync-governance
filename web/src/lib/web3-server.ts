import { fallback } from '@wagmi/core'
import { createConfig, http } from 'wagmi'
import { mainnet, zksync } from 'wagmi/chains'

import { env } from './env'

export const chains = [zksync, mainnet] as const

const mainnetBatch = {
  batch: {
    batchSize: 1_024,
  },
}

export const transports = {
  [zksync.id]: fallback([
    http(env.ZKSYNC_RPC_URL),
    http(env.ZKSYNC_RPC_URL_FALLBACK),
    http('https://mainnet.era.zksync.io'),
  ]),
  [mainnet.id]: fallback([
    http(env.ETH_RPC_URL, mainnetBatch),
    http(env.ETH_RPC_URL_FALLBACK, mainnetBatch),
    http('https://ethereum-rpc.publicnode.com', mainnetBatch),
  ]),
}

export const wagmiConfigForServer = createConfig({
  chains,
  transports,
})
