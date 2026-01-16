'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { isAddress } from 'viem'

import { ProposalStatus } from '@/components/ProposalStatus'
import { buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { useProposals } from '@/hooks/useProposals'
import {
  GOVERNORS,
  bigintToFormattedString,
  cn,
  formatTimestamp,
  getGovernorName,
  getPercentageOfTotalVotes,
  getTotalVotes,
} from '@/lib/utils'

function ProposalRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="md:max-w-0">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-72" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-6 w-20" />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Skeleton className="h-5 w-16 ml-auto" />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <Skeleton className="h-8 w-8 rounded-full mx-auto" />
      </TableCell>
    </TableRow>
  )
}

export function ProposalsTableSkeleton() {
  return (
    <div className="shadow-custom-card rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proposal</TableHead>
            <TableHead className="hidden w-36 md:table-cell">Status</TableHead>
            <TableHead className="hidden w-24 text-right lg:table-cell">
              Votes
            </TableHead>
            <TableHead className="w-26 hidden lg:table-cell" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <ProposalRowSkeleton />
          <ProposalRowSkeleton />
          <ProposalRowSkeleton />
          <ProposalRowSkeleton />
          <ProposalRowSkeleton />
        </TableBody>
      </Table>
    </div>
  )
}

export function ProposalsClient() {
  const { data: allProposals, isLoading } = useProposals()
  const searchParams = useSearchParams()
  const _governor = searchParams.get('governor') ?? ''
  const governor = isAddress(_governor) ? _governor : undefined
  const router = useRouter()

  const proposals = (allProposals ?? []).filter((proposal) => {
    if (!governor) return true
    return proposal.governor === governor.toLowerCase()
  })

  return (
    <>
      <div className="lg:absolute lg:right-0 lg:transform lg:-translate-y-12 lg:-translate-x-6 mb-4">
        <Select
          defaultValue={governor || 'all'}
          onValueChange={(value) => {
            if (value === 'all') {
              router.push('/')
            } else {
              router.push(`/?governor=${value}`)
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Governor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Governors</SelectItem>
            {Array.from(GOVERNORS.entries()).map(([address, name]) => (
              <SelectItem key={address} value={address}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="shadow-custom-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proposal</TableHead>
              <TableHead className="hidden w-36 md:table-cell">
                Status
              </TableHead>
              <TableHead className="hidden w-24 text-right lg:table-cell">
                Votes
              </TableHead>
              <TableHead className="w-26 hidden lg:table-cell" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                <ProposalRowSkeleton />
                <ProposalRowSkeleton />
                <ProposalRowSkeleton />
                <ProposalRowSkeleton />
                <ProposalRowSkeleton />
              </>
            ) : (
              proposals.map((proposal) => (
                <TableRow key={proposal.id} className="group">
                  {/* Not sure why max-w-0 is needed here, but it seems to work fine in all browsers */}
                  <TableCell className="md:max-w-0">
                    <div className="flex flex-col gap-2">
                      <Typography
                        as="span"
                        className="text-xs font-medium text-zinc-500"
                      >
                        {formatTimestamp(proposal.createdAtTimestamp)} |{' '}
                        {getGovernorName(proposal.governor)}
                      </Typography>
                      <Link
                        href={`/proposal/${proposal.id}`}
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
                    <ProposalStatus proposal={proposal} />
                  </TableCell>

                  <TableCell className="hidden text-right lg:table-cell">
                    <span className="block pb-1">
                      {bigintToFormattedString(getTotalVotes(proposal))}
                    </span>

                    <div className="flex items-center gap-1 text-xs font-semibold leading-none justify-end">
                      <span className="text-brand-green">
                        {getPercentageOfTotalVotes(proposal.forVotes, proposal)}%
                      </span>
                      <span className="text-zinc-200">|</span>
                      <span className="text-brand-red">
                        {getPercentageOfTotalVotes(
                          proposal.againstVotes,
                          proposal
                        )}
                        %
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="lg:table-cell hidden">
                    {proposal.status === 'active' ? (
                      <Link
                        className={cn(
                          buttonVariants({ variant: 'primary' }),
                          'rounded-full w-fit flex items-center justify-center mx-auto'
                        )}
                        href={`/proposal/${proposal.id}`}
                      >
                        Vote
                      </Link>
                    ) : (
                      <Link
                        href={`/proposal/${proposal.id}`}
                        className="w-full flex items-center justify-center"
                        aria-label="View proposal"
                      >
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
