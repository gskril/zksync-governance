import { EnhancedProposalWithVotes } from 'indexer/types'

import { Typography } from '@/components/ui/typography'
import {
  bigintToFormattedString,
  cn,
  getPercentageOfTotalVotes,
} from '@/lib/utils'

type Props = {
  proposal: EnhancedProposalWithVotes
  voteType: 'for' | 'against' | 'abstain'
}

export function VoteBar({ proposal, voteType }: Props) {
  const key = `${voteType}Votes` as const

  return (
    <div className="relative overflow-hidden rounded bg-zinc-50">
      <div className="relative z-10 flex justify-between gap-2 p-2 text-sm capitalize leading-none">
        <Typography className="font-medium">
          {bigintToFormattedString(proposal[key], { millions: true })}
        </Typography>

        <Typography>{voteType}</Typography>
      </div>

      <div
        className={cn(
          'absolute left-0 top-0 z-0 h-full rounded',
          voteType === 'for' && 'bg-brand-green/20',
          voteType === 'against' && 'bg-brand-red/20',
          voteType === 'abstain' && 'bg-zinc-500/20'
        )}
        style={{
          width: `${getPercentageOfTotalVotes(proposal[key], proposal)}%`,
        }}
      />
    </div>
  )
}
