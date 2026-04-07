'use client'

import { getPropStatus } from 'indexer/utils'
import Link from 'next/link'
import { delegateNames } from 'shared'
import { Address } from 'viem'
import { useEnsName } from 'wagmi'

import { CopyAddressButton } from '@/components/CopyButton'
import { DelegateButton } from '@/components/DelegateButton'
import { ProposalStatus } from '@/components/ProposalStatus'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Typography } from '@/components/ui/typography'
import { useDelegate } from '@/hooks/useDelegate'
import { env } from '@/lib/env'
import {
  bigintToFormattedString,
  formatTimestamp,
  truncateAddress,
} from '@/lib/utils'

function getDelegateName(
  address: Address,
  ensName: string | null | undefined
): string {
  const hardcodedName = delegateNames[address]
  if (hardcodedName) return hardcodedName
  if (ensName) return ensName
  return truncateAddress(address)
}

export function DelegateHeader({ address }: { address: Address }) {
  const { data: ensName, isLoading: ensLoading } = useEnsName({
    address,
    chainId: 1,
  })

  const name = getDelegateName(address, ensName)
  const isEnsName = name?.includes('.')
  const showCopyButton = !name.includes('...')

  if (ensLoading) {
    return (
      <div className="flex flex-col gap-4 md:flex-row items-center">
        <Skeleton className="w-28 h-28 md:w-40 md:h-40 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row items-center">
      <img
        src={
          isEnsName
            ? `https://ens-api.gregskril.com/avatar/${name}?width=320&fallback=${env.BASE_URL}/img/fallback-avatar.svg`
            : '/img/fallback-avatar.svg'
        }
        alt={name}
        width={160}
        height={160}
        className="w-28 rounded-full object-cover border-6 border-white shadow-[0_0_22px_0_#00000029] md:w-40"
      />

      <div className="space-y-3">
        <h1 className="space-y-3 text-3xl font-bold leading-none lg:text-5xl">
          {name}
        </h1>
        {showCopyButton && (
          <div className="flex items-center gap-1.5">
            <CopyAddressButton address={address} />
          </div>
        )}
      </div>
    </div>
  )
}

export function VotingPowerCard({ address }: { address: Address }) {
  const { data: delegate, isLoading, error, isError } = useDelegate(address)

  if (isLoading || !delegate) {
    return (
      <Card className="h-fit flex flex-row items-center justify-between gap-10 p-4 w-full md:w-fit">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-10 w-24 rounded-full" />
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="h-fit flex flex-col gap-2 p-4 w-full md:w-fit">
        <Typography className="text-red-600 font-semibold">
          Failed to load delegate data
        </Typography>
        <Typography className="text-sm text-zinc-500">
          {error instanceof Error ? error.message : 'An error occurred'}
        </Typography>
      </Card>
    )
  }

  return (
    <Card className="h-fit flex flex-row items-center justify-between gap-10 p-4 w-full md:w-fit">
      <div className="flex flex-col">
        <Typography className="text-sm">Voting Power</Typography>
        <Typography className="font-bold text-xl">
          {bigintToFormattedString(BigInt(delegate.votes ?? 0))} ZK
        </Typography>
      </div>

      <DelegateButton delegate={delegate} />
    </Card>
  )
}

function VotingHistoryRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="md:max-w-0">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-6 w-20" />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Skeleton className="h-6 w-16 ml-auto" />
      </TableCell>
    </TableRow>
  )
}

export function VotingHistoryTable({ address }: { address: Address }) {
  const { data: delegate, isLoading, error, isError } = useDelegate(address)

  return (
    <div className="shadow-custom-card rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Voting History</TableHead>
            <TableHead className="hidden w-36 md:table-cell">Status</TableHead>
            <TableHead className="hidden w-24 text-right lg:table-cell">
              Vote
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <>
              <VotingHistoryRowSkeleton />
              <VotingHistoryRowSkeleton />
              <VotingHistoryRowSkeleton />
            </>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Typography className="text-red-600 font-semibold">
                    Failed to load voting history
                  </Typography>
                  <Typography className="text-sm text-zinc-500">
                    {error instanceof Error ? error.message : 'An error occurred'}
                  </Typography>
                </div>
              </TableCell>
            </TableRow>
          ) : !delegate || delegate.voteCasts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                This account has not voted on any proposals yet.
              </TableCell>
            </TableRow>
          ) : (
            delegate.voteCasts.map(({ proposalId, proposal, support }) => (
              <TableRow key={proposalId} className="group">
                <TableCell className="md:max-w-0">
                  <div className="flex flex-col gap-2">
                    <Typography
                      as="span"
                      className="text-xs font-medium text-zinc-500"
                    >
                      {formatTimestamp(proposal.createdAtTimestamp)}
                    </Typography>
                    <Link
                      href={`/proposal/${proposalId}`}
                      className="font-medium hover:underline group-hover:text-brand-primary"
                    >
                      {proposal.title}
                    </Link>
                    <Typography
                      as="p"
                      className="text-sm text-zinc-500 max-w-full line-clamp-2"
                    >
                      {proposal.summary}
                    </Typography>
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <ProposalStatus
                    proposal={
                      {
                        ...proposal,
                        status: getPropStatus(proposal as any),
                      } as any
                    }
                  />
                </TableCell>

                <TableCell className="hidden text-right lg:table-cell">
                  <Badge
                    variant={
                      support === 0
                        ? 'destructive'
                        : support === 2
                          ? 'secondary'
                          : 'success'
                    }
                    className="uppercase"
                  >
                    {support === 0
                      ? 'Against'
                      : support === 2
                        ? 'Abstain'
                        : 'For'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
