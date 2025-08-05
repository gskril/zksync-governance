import { createConfig } from 'ponder'
import { http } from 'viem'

import { GovernorContract } from './contracts'

export default createConfig({
  chains: {
    zkSync: {
      id: 324,
      rpc: http(process.env.PONDER_RPC_URL),
    },
  },
  contracts: {
    Governor: {
      ...GovernorContract,
      chain: 'zkSync',
    },
  },
})
