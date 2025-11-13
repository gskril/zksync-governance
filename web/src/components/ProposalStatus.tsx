import { EnhancedProposal } from 'indexer/types'

import { cn } from '@/lib/utils'

import { Badge, BadgeProps } from './ui/badge'

type Props = {
  proposal: EnhancedProposal
} & React.HTMLAttributes<HTMLDivElement>

export function ProposalStatus({ proposal, className }: Props) {
  let variant: BadgeProps['variant'] = 'primary'

  const successBadge: EnhancedProposal['status'][] = [
    'succeeded',
    'queued',
    'executed',
  ]
  const failedBadge: EnhancedProposal['status'][] = ['defeated']

  if (successBadge.includes(proposal.status)) {
    variant = 'success'
  } else if (failedBadge.includes(proposal.status)) {
    variant = 'destructive'
  } else if (proposal.status === 'canceled') {
    variant = 'secondary'
  } else if (proposal.status === 'pending') {
    variant = 'warning'
  }

  return (
    <Badge variant={variant} className={cn('w-fit', className)}>
      {proposal.status === 'succeeded'
        ? 'PASSED'
        : proposal.status.toUpperCase()}
    </Badge>
  )
}
