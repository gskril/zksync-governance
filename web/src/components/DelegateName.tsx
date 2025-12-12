'use client'

import { env } from '@/lib/env'
import { delegateNames } from 'indexer/names'
import { nameWithFallback } from '@/lib/utils'
import { Address } from 'viem'
import { useEnsName } from 'wagmi'

export function DelegateName({ address }: { address: Address }) {
  const nickname = delegateNames[address]

  const { data: ensName } = useEnsName({
    address,
    chainId: 1,
    query: {
      enabled: !!address,
    },
  })

  return (
    <div className="flex items-center gap-2">
      <img
        src={
          ensName
            ? `https://ens-api.gregskril.com/avatar/${ensName}?width=64&fallback=${env.BASE_URL}/img/fallback-avatar.svg`
            : '/img/fallback-avatar.svg'
        }
        alt={nameWithFallback(nickname || ensName, address)}
        className="size-8 rounded-full object-cover"
      />
      <span>{nameWithFallback(nickname || ensName, address)}</span>
    </div>
  )
}
