'use client'

import Link from 'next/link'
import { ProposalStatus } from '@/components/ProposalStatus'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  bigintToFormattedString,
  cn,
  formatTimestamp,
  getGovernorName,
  getPercentageOfTotalVotes,
  getTotalVotes,
  GOVERNORS,
} from '@/lib/utils'
import { Typography } from '@/components/ui/typography'
import { buttonVariants } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'
import { EnhancedProposal } from 'indexer/types'
import { isAddress } from 'viem'

type Props = {
  proposals: EnhancedProposal[]
}

export function ProposalsClient({ proposals: allProposals }: Props) {
  const searchParams = useSearchParams()
  const _governor = searchParams.get('governor') ?? ''
  const governor = isAddress(_governor) ? _governor : undefined
  const router = useRouter()

  const proposals = allProposals.filter((proposal) => {
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
            {proposals.map((proposal) => (
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
                    >
                      <ChevronRight className="size-4" />
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
