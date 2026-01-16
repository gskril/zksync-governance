'use client'

import { EnhancedProposalWithVotes } from 'indexer/types'
import { ArrowDown } from 'lucide-react'

import { ProposalActionButton } from '@/components/ProposalActionButton'
import { ProposalStatus } from '@/components/ProposalStatus'
import { ProposalVote } from '@/components/ProposalVote'
import { VoteBar } from '@/components/VoteBar'
import { VoteButton } from '@/components/VoteButton'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Typography } from '@/components/ui/typography'
import { useProposal } from '@/hooks/useProposal'
import {
  bigintToFormattedString,
  formatTimestamp,
  getQuorumProgress,
  parseVotes,
} from '@/lib/utils'

function VotingCardHeader({
  proposal,
}: {
  proposal: EnhancedProposalWithVotes
}) {
  return (
    <CardHeader className="space-y-2">
      <CardTitle className="mb-4">Votes</CardTitle>

      <VoteBar proposal={proposal} voteType="for" />

      <VoteBar proposal={proposal} voteType="against" />

      {parseVotes(proposal.abstainVotes) > 0 && (
        <VoteBar proposal={proposal} voteType="abstain" />
      )}

      {/* Quorum bar */}
      <div className="relative overflow-hidden rounded bg-zinc-50">
        <div className="relative z-10 flex justify-between gap-2 p-2 text-sm capitalize leading-none">
          {(() => {
            const votesTowadsQuorum = BigInt(proposal.forVotes)
            const quorum = BigInt(proposal.quorum)

            if (votesTowadsQuorum >= quorum) {
              return (
                <>
                  <Typography className="font-medium">
                    {bigintToFormattedString(quorum)}
                  </Typography>
                  <Typography>Quorum Reached</Typography>
                </>
              )
            }

            return (
              <>
                <Typography className="font-medium">
                  {bigintToFormattedString(quorum - votesTowadsQuorum, {
                    millions: true,
                  })}
                </Typography>
                <Typography>Votes to Quorum</Typography>
              </>
            )
          })()}
        </div>

        <div
          className="absolute left-0 top-0 z-0 h-full rounded bg-brand-freedom-blue"
          style={{
            width: `${getQuorumProgress(proposal)}%`,
          }}
        />
      </div>
    </CardHeader>
  )
}

function VotingCardSkeleton() {
  return (
    <CardHeader className="space-y-2">
      <Skeleton className="h-6 w-16 mb-4" />
      <Skeleton className="h-10 w-full rounded" />
      <Skeleton className="h-10 w-full rounded" />
      <Skeleton className="h-10 w-full rounded" />
    </CardHeader>
  )
}

export function ProposalStatusClient({ proposalId }: { proposalId: string }) {
  const { data: proposal, isLoading } = useProposal(proposalId)

  if (isLoading || !proposal) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-48" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <ProposalStatus proposal={proposal} />
      <Typography className="text-sm text-zinc-500">
        {Number(proposal.endTimestamp) > Date.now() / 1000 ? 'Ends' : 'Ended'}{' '}
        {formatTimestamp(proposal.endTimestamp, { includeTime: true })}
      </Typography>
    </div>
  )
}

export function ProposalActionsClient({ proposalId }: { proposalId: string }) {
  const { data: proposal, isLoading } = useProposal(proposalId)

  if (isLoading || !proposal) {
    return null
  }

  const buttonStatuses = ['active', 'succeeded', 'queued']
  const showButton = buttonStatuses.includes(proposal.status)

  if (!showButton) return null

  return (
    <div className="lg:w-fit lg:justify-self-end">
      {proposal.status === 'active' && <VoteButton proposal={proposal} />}

      {proposal.status === 'succeeded' && (
        <ProposalActionButton proposal={proposal} action="queue" />
      )}

      {proposal.status === 'queued' && (
        <ProposalActionButton proposal={proposal} action="execute" />
      )}
    </div>
  )
}

export function MobileVotesCard({ proposalId }: { proposalId: string }) {
  const { data: proposal, isLoading } = useProposal(proposalId)

  return (
    <>
      <Card className="lg:hidden">
        {isLoading || !proposal ? (
          <VotingCardSkeleton />
        ) : (
          <VotingCardHeader proposal={proposal} />
        )}
      </Card>

      <a
        href="#votes"
        className={buttonVariants({
          variant: 'default',
          size: 'lg',
          className: 'w-full lg:hidden',
        })}
      >
        <ArrowDown />
        Skip to Votes
      </a>
    </>
  )
}

export function VotesPanel({ proposalId }: { proposalId: string }) {
  const { data: proposal, isLoading } = useProposal(proposalId)

  if (isLoading || !proposal) {
    return (
      <Card
        className="sticky top-6 overflow-y-scroll rounded-xl shadow-custom-card lg:h-[calc(100svh-3rem)]"
        id="votes"
      >
        <VotingCardSkeleton />
        <hr />
        <div className="px-6 py-4">
          <Skeleton className="h-6 w-20" />
        </div>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="sticky top-6 overflow-y-scroll rounded-xl shadow-custom-card lg:h-[calc(100svh-3rem)]"
      id="votes"
    >
      <VotingCardHeader proposal={proposal} />

      <hr />

      <Tabs defaultValue="voted">
        <div className="flex gap-4 items-center justify-between px-6 py-4 sticky top-0 bg-background border-b mb-4">
          <CardTitle>Voters</CardTitle>
          <TabsList className="rounded-full">
            <TabsTrigger value="voted" className="rounded-full">
              Voted
            </TabsTrigger>
            <TabsTrigger value="notVoted" className="rounded-full">
              Didn't vote
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="voted">
          <CardContent className="space-y-4">
            {proposal.votes.map((vote) => {
              return (
                <ProposalVote
                  key={vote.id}
                  vote={vote}
                  voter={vote.voter}
                  weight={vote.weight}
                />
              )
            })}
          </CardContent>
        </TabsContent>

        <TabsContent value="notVoted">
          <CardContent className="space-y-4">
            {proposal.didntVote.map(({ address, votes }) => {
              return (
                <ProposalVote
                  key={address}
                  voter={address}
                  weight={votes ?? '0'}
                />
              )
            })}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
