import { loadBalance } from '@ponder/utils'
import { createConfig } from 'ponder'
import { http } from 'viem'

import {
  ZkGovOpsGovernor,
  ZkProtocolGovernor,
  ZkToken,
  ZkTokenGovernor,
} from './contracts'

const isDev = process.env.NODE_ENV === 'development'

export default createConfig({
  chains: {
    zkSync: {
      id: 324,
      rpc: loadBalance([http('https://mainnet.era.zksync.io')]),
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
      endBlock: isDev ? 60410162 : undefined,
    },
    Token: {
      address: ZkToken.address,
      abi: ZkToken.abi,
      chain: 'zkSync',
      startBlock: isDev ? 55000000 : ZkToken.startBlock,
      endBlock: isDev ? 60410162 : undefined,
    },
  },
})
