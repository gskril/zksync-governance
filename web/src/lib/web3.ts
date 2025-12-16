import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  baseAccount,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { createConfig } from 'wagmi'

import { env } from './env'
import { chains, transports } from './web3-server'

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        baseAccount,
        walletConnectWallet,
        safeWallet,
      ],
    },
  ],
  {
    appName: 'ZKsync Governance',
    projectId: env.WALLETCONNECT_ID,
  }
)

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports,
})
