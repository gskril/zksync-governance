'use client'

import { env } from '@/lib/env'
import { delegateNames } from 'indexer/names'
import { cn, nameWithFallback } from '@/lib/utils'
import { Address } from 'viem'
import { useEnsName } from 'wagmi'

type DelegateNameProps = {
  address: Address
  size?: 'sm' | 'md'
}

export function DelegateName({ address, size = 'md' }: DelegateNameProps) {
  const nickname = delegateNames[address]

  const { data: ensName } = useEnsName({
    address,
    chainId: 1,
    query: {
      enabled: !!address,
    },
  })

  return (
    <div
      className={cn(
        'flex items-center',
        size === 'md' && 'gap-2',
        size === 'sm' && 'gap-1'
      )}
    >
      <img
        src={
          ensName
            ? `https://ens-api.gregskril.com/avatar/${ensName}?width=64&fallback=${env.BASE_URL}/img/fallback-avatar.svg`
            : '/img/fallback-avatar.svg'
        }
        alt={nameWithFallback(nickname || ensName, address)}
        className={cn(
          'rounded-full object-cover',
          size === 'md' && 'size-8',
          size === 'sm' && 'size-6'
        )}
      />
      <span
        className={cn(size === 'md' && 'text-base', size === 'sm' && 'text-sm')}
      >
        {nameWithFallback(nickname || ensName, address)}
      </span>
    </div>
  )
}
