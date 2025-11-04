import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { zksync, mainnet } from 'wagmi/chains'
import { env } from './env'

const { connectors } = getDefaultWallets({
  appName: 'ZKsync Governance',
  projectId: env.WALLETCONNECT_ID,
})

export const wagmiConfig = createConfig({
  chains: [zksync, mainnet],
  connectors,
  transports: {
    [zksync.id]: http(env.ZKSYNC_RPC_URL),
    [mainnet.id]: http(env.ETH_RPC_URL),
  },
})
