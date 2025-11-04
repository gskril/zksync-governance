import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { ProposalStatus } from '@/components/ProposalStatus'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getProposals } from '@/hooks/useProposals'
import {
  bigintToFormattedString,
  cn,
  formatTimestamp,
  getGovernorName,
  getPercentageOfTotalVotes,
  getTotalVotes,
} from '@/lib/utils'
import { Nav } from '@/components/Nav'
import { Typography } from '@/components/ui/typography'
import { buttonVariants } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { getDelegates } from '@/hooks/useDelegates'
import { GetDelegatesResponse } from 'indexer/types'

// Serve from cache but revalidate every 60 seconds (ISR)
export const revalidate = 60

export default async function Delegates() {
  // const delegates = await getDelegates()
  const delegates: GetDelegatesResponse = []

  return (
    <div className="container">
      <Nav />

      <div className="mb-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:gap-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <img
              src="/img/logo-filled.svg"
              alt="ZKsync Logo"
              width={160}
              height={160}
              className="w-28 -rotate-3 rounded-3xl border-6 border-white shadow-[0_0_22px_0_#00000029] md:w-40"
            />

            <div className="space-y-3">
              <h1 className="space-y-3">
                <span className="line block text-2xl font-bold leading-none text-brand-primary">
                  ZKsync
                </span>{' '}
                <span className="block text-3xl font-bold leading-none lg:text-5xl">
                  Delegates
                </span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="shadow-custom-card rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Delegate</TableHead>
              <TableHead className="hidden w-36 md:table-cell">
                Voting Power
              </TableHead>
              <TableHead className="hidden w-42 text-right lg:table-cell">
                Vote History
              </TableHead>
              <TableHead className="w-26 hidden lg:table-cell" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* {proposals.map((proposal) => (
              <TableRow key={proposal.id} className="group">
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
            ))} */}
          </TableBody>
        </Table>
      </div>

      <Footer />
    </div>
  )
}
