import { loadBalance } from '@ponder/utils'
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
      rpc: loadBalance([
        // http(process.env.PONDER_RPC_URL)
        http('https://mainnet.era.zksync.io'),
        http('https://1rpc.io/zksync2-era'),
        http('https://rpc.ankr.com/zksync_era'),
      ]),
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
