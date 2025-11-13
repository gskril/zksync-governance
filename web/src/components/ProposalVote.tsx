'use client'

import { EnhancedProposalWithVotes } from 'indexer/types'
// import { useInView } from 'react-intersection-observer'
import { useEnsName } from 'wagmi'

import { bigintToFormattedString, cn, nameWithFallback } from '@/lib/utils'
import { Typography } from '@/components/ui/typography'
import { delegateNames } from '@/lib/names'
import { env } from '@/lib/env'

type Props = { vote: EnhancedProposalWithVotes['votes'][number] }

export function ProposalVote({ vote }: Props) {
  // TODO: Find a way to do this in batches so we can take advantage of multicall
  // const { ref, inView } = useInView({
  //   rootMargin: '100px',
  //   threshold: 0.5,
  //   triggerOnce: true, // Only trigger once when it comes into view
  // })

  const manualName = delegateNames[vote.voter]

  const { data: ensName } = useEnsName({
    address: vote.voter,
    chainId: 1,
    query: {
      // enabled: inView, // Only run the query when the component is in viewport
    },
  })

  return (
    <div key={vote.id} className="space-y-1.5 text-sm font-medium">
      <div className="flex w-full justify-between gap-4">
        <div className="flex items-center gap-1">
          <img
            src={
              ensName
                ? `https://ens-api.gregskril.com/avatar/${ensName}?width=48&fallback=${env.BASE_URL}/img/fallback-avatar.svg`
                : '/img/fallback-avatar.svg'
            }
            loading="lazy"
            alt={nameWithFallback(ensName, vote.voter)}
            className="size-6 rounded-full object-cover"
          />
          <a
            href={
              ensName
                ? `https://app.ens.domains/${ensName}`
                : `https://etherscan.io/address/${vote.voter}`
            }
            target="_blank"
            rel="noreferrer"
          >
            {nameWithFallback(manualName || ensName, vote.voter)}
          </a>
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
        </div>

        <div>{bigintToFormattedString(vote.weight)}</div>
      </div>

      {vote.reason && (
        <Typography as="span" className="block text-zinc-600">
          {vote.reason}
        </Typography>
      )}
    </div>
  )
}
