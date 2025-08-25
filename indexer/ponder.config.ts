import { loadBalance } from '@ponder/utils'
import { createConfig } from 'ponder'
import { http } from 'viem'

import {
  ZkGovOpsGovernor,
  ZkProtocolGovernor,
  ZkToken,
  ZkTokenGovernor,
} from './contracts'

export default createConfig({
  chains: {
    zkSync: {
      id: 324,
      rpc: loadBalance([
        http('https://mainnet.era.zksync.io'),
        http('https://1rpc.io/zksync2-era'),
        http('https://rpc.ankr.com/zksync_era'),
      ]),
    },
  },
  contracts: {
    Governor: {
      address: [
        ZkTokenGovernor.address,
        ZkProtocolGovernor.address,
        ZkGovOpsGovernor.address,
      ],
      abi: ZkTokenGovernor.abi,
      chain: 'zkSync',
      startBlock: ZkProtocolGovernor.startBlock, // earliest deployment of the 3 governors
    },
    Token: {
      address: ZkToken.address,
      abi: ZkToken.abi,
      chain: 'zkSync',
      startBlock: ZkToken.startBlock,
    },
  },
})
