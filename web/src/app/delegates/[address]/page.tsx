import { Footer } from '@/components/Footer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatTimestamp, truncateAddress } from '@/lib/utils'
import { Nav } from '@/components/Nav'
import { Metadata } from 'next'
import { delegateNames } from '@/lib/names'
import { Address } from 'viem'
import { getPublicClient } from 'wagmi/actions'
import { wagmiConfigForServer } from '@/lib/web3-server'
import { getDelegate } from '@/hooks/useDelegate'
import { notFound } from 'next/navigation'
import { ProposalStatus } from '@/components/ProposalStatus'
import { Typography } from '@/components/ui/typography'
import Link from 'next/link'
import { getPropStatus } from 'indexer/utils'
import { Badge } from '@/components/ui/badge'

// Serve from cache but revalidate every 60 seconds (ISR)
export const revalidate = 60

async function getDelegateName(address: Address) {
  let name: string | null | undefined

  name = delegateNames[address]

  if (!name) {
    const client = getPublicClient(wagmiConfigForServer, { chainId: 1 })
    name = await client.getEnsName({ address })
  }

  if (!name) {
    name = truncateAddress(address)
  }

  return name
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: Address }>
}): Promise<Metadata> {
  const { address } = await params
  const name = await getDelegateName(address)

  return {
    title: `${name} - ZKsync Delegate`,
    description: `View the voting history of ${name} as a delegate of the ZKsync Governance System.`,
  }
}

export default async function Delegate({
  params,
}: {
  params: Promise<{ address: Address }>
}) {
  const { address } = await params
  const delegate = await getDelegate(address)
  const name = await getDelegateName(address)

  if (!delegate) {
    return notFound()
  }

  return (
    <div className="container">
      <Nav />

      <div className="mb-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:gap-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* TODO: Load avatar */}
            {/* <img
              src="/img/logo-filled-dark.svg"
              alt="ZKsync Logo"
              width={160}
              height={160}
              className="w-28 -rotate-3 rounded-3xl border-6 border-white shadow-[0_0_22px_0_#00000029] md:w-40"
            /> */}

            <h1 className="space-y-3 text-3xl font-bold leading-none lg:text-5xl">
              {name}
            </h1>
          </div>
        </div>
      </div>

      <div className="shadow-custom-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voting History</TableHead>
              <TableHead className="hidden w-36 md:table-cell">
                Status
              </TableHead>
              <TableHead className="hidden w-24 text-right lg:table-cell">
                Vote
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {delegate.voteCasts.map(({ proposal, support }) => (
              <TableRow key={proposal.id} className="group">
                {/* Not sure why max-w-0 is needed here, but it seems to work fine in all browsers */}
                <TableCell className="md:max-w-0">
                  <div className="flex flex-col gap-2">
                    <Typography
                      as="span"
                      className="text-xs font-medium text-zinc-500"
                    >
                      {formatTimestamp(proposal.createdAtTimestamp)}
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
                  <Badge variant={support === 0 ? 'destructive' : 'success'}>
                    {support === 0 ? 'Against' : 'For'}
                  </Badge>
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
