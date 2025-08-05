import { createConfig } from 'ponder'
import { http } from 'viem'

import {
  GovernorContract,
  ZkGovOpsGovernor,
  ZkProtocolGovernor,
} from './contracts'

export default createConfig({
  chains: {
    zkSync: {
      id: 324,
      rpc: http(process.env.PONDER_RPC_URL),
    },
  },
  contracts: {
    Governor: {
      address: [
        GovernorContract.address,
        ZkProtocolGovernor.address,
        ZkGovOpsGovernor.address,
      ],
      abi: GovernorContract.abi,
      chain: 'zkSync',
    },
  },
})
