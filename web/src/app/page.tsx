import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { ProposalStatus } from '@/components/ProposalStatus'
import { DiscourseIcon, XIcon } from '@/components/icons'
import { IconWrapper } from '@/components/icons/IconWrapper'
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
  formatTimestamp,
  getGovernorName,
  getPercentageOfTotalVotes,
  getTotalVotes,
} from '@/lib/utils'
import { Nav } from '@/components/Nav'
import { Typography } from '@/components/ui/typography'

// Serve from cache but revalidate every 60 seconds (ISR)
export const revalidate = 60

export default async function Home() {
  const proposals = await getProposals()

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
                  Governance
                </span>
              </h1>

              <h2 className="text-base text-zinc-500">
                View and vote on proposals in the ZKsync Governance System.
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="shadow-custom-card rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proposal</TableHead>
              <TableHead className="hidden w-36 lg:table-cell">
                Status
              </TableHead>
              <TableHead className="hidden w-24 text-right md:table-cell">
                Votes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.map((proposal) => (
              <TableRow key={proposal.id} className="group">
                {/* <TableCell className="space-y-0.5">
                  <ProposalStatus
                    proposal={proposal}
                    className="table-cell lg:hidden"
                  />

                  <span className="block">
                    {formatTimestamp(proposal.createdAtTimestamp)}
                  </span>
                </TableCell> */}

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
                <TableCell className="hidden lg:table-cell">
                  <ProposalStatus proposal={proposal} />
                </TableCell>
                <TableCell className="hidden text-right md:table-cell">
                  <span className="block pb-1">
                    {bigintToFormattedString(getTotalVotes(proposal))}
                  </span>

                  <div className="flex items-center gap-1 text-xs font-semibold leading-none">
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Footer />
    </div>
  )
}
