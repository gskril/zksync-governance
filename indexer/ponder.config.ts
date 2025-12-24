import { loadBalance } from '@ponder/utils'
import { createConfig, factory } from 'ponder'
import {
  ZkCappedMinterV2,
  ZkCappedMinterV2Factory,
  ZkGovOpsGovernor,
  ZkProtocolGovernor,
  ZkToken,
  ZkTokenGovernor,
} from 'shared/contracts'
import { http } from 'viem'

const isDev = process.env.NODE_ENV === 'development'

export default createConfig({
  chains: {
    zkSync: {
      id: 324,
      rpc: loadBalance([http('https://mainnet.era.zksync.io')]),
    },
    mainnet: {
      id: 1,
      rpc: http('https://ethereum-rpc.publicnode.com'),
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
    CappedMinterFactory: {
      address: ZkCappedMinterV2Factory.address,
      abi: ZkCappedMinterV2Factory.abi,
      chain: 'zkSync',
      startBlock: ZkCappedMinterV2Factory.startBlock,
    },
    CappedMinter: {
      abi: ZkCappedMinterV2.abi,
      chain: 'zkSync',
      startBlock: ZkCappedMinterV2Factory.startBlock,
      address: factory({
        address: ZkCappedMinterV2Factory.address,
        event: ZkCappedMinterV2Factory.abi[1],
        parameter: 'minterAddress',
      }) as any,
    },
  },
})
