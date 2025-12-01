'use client'

import Link from 'next/link'
import { EnhancedProposalWithVotes } from 'indexer/types'
// import { useInView } from 'react-intersection-observer'
import { useEnsName } from 'wagmi'

import { bigintToFormattedString, cn, nameWithFallback } from '@/lib/utils'
import { Typography } from '@/components/ui/typography'
import { delegateNames } from '@/lib/names'
import { env } from '@/lib/env'
import { Address } from 'viem'

type Props = {
  vote?: EnhancedProposalWithVotes['votes'][number]
  voter: Address
  weight: string
}

export function ProposalVote({ vote, voter, weight }: Props) {
  // TODO: Find a way to do this in batches so we can take advantage of multicall
  // const { ref, inView } = useInView({
  //   rootMargin: '100px',
  //   threshold: 0.5,
  //   triggerOnce: true, // Only trigger once when it comes into view
  // })

  const manualName = delegateNames[voter]

  const { data: ensName } = useEnsName({
    address: voter,
    chainId: 1,
    query: {
      // enabled: inView, // Only run the query when the component is in viewport
    },
  })

  return (
    <div key={voter} className="space-y-1.5 text-sm font-medium">
      <div className="flex w-full justify-between gap-4">
        <div className="flex items-center gap-1">
          <img
            src={
              ensName
                ? `https://ens-api.gregskril.com/avatar/${ensName}?width=48&fallback=${env.BASE_URL}/img/fallback-avatar.svg`
                : '/img/fallback-avatar.svg'
            }
            loading="lazy"
            alt={nameWithFallback(ensName, voter)}
            className="size-6 rounded-full object-cover"
          />
          <Link href={`/delegates/${voter}`}>
            {nameWithFallback(manualName || ensName, voter)}
          </Link>
          {vote && (
            <span
              className={cn(
                vote.support === 0 && 'text-brand-red',
                vote.support === 1 && 'text-brand-green',
                vote.support === 2 && 'text-zinc-500',
                'font-medium'
              )}
            >
              {vote.support === 0
                ? 'voted against'
                : vote.support === 1
                  ? 'voted for'
                  : 'abstained'}
            </span>
          )}
        </div>

        <div>{bigintToFormattedString(weight)}</div>
      </div>

      {vote?.reason && (
        <Typography as="span" className="block text-zinc-600">
          {vote.reason}
        </Typography>
      )}
    </div>
  )
}
