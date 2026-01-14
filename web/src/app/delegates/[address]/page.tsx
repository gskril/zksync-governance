import { getPropStatus } from 'indexer/utils'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { delegateNames } from 'shared'
import { Address } from 'viem'
import { getPublicClient } from 'wagmi/actions'

import { CopyAddressButton } from '@/components/CopyButton'
import { DelegateButton } from '@/components/DelegateButton'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { ProposalStatus } from '@/components/ProposalStatus'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Typography } from '@/components/ui/typography'
import { getDelegate } from '@/hooks/useDelegate'
import { env } from '@/lib/env'
import {
  bigintToFormattedString,
  formatTimestamp,
  truncateAddress,
} from '@/lib/utils'
import { wagmiConfigForServer } from '@/lib/web3-server'

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

type DelegatePageProps = {
  params: Promise<{ address: Address }>
}

export async function generateMetadata({
  params,
}: DelegatePageProps): Promise<Metadata> {
  const { address } = await params
  const name = await getDelegateName(address)

  return {
    title: `${name} - ZKsync Delegate`,
    description: `View the voting history of ${name} as a delegate of the ZKsync Governance System.`,
  }
}

export default async function Delegate({ params }: DelegatePageProps) {
  const { address } = await params
  const delegate = await getDelegate(address)
  const name = await getDelegateName(address)
  const isEnsName = name?.includes('.')

  if (!delegate) {
    return notFound()
  }

  return (
    <div className="container">
      <Nav />

      <div className="mb-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:gap-12 items-center">
          <div className="flex flex-col gap-4 md:flex-row items-center">
            <Image
              src={
                isEnsName
                  ? `https://ens-api.gregskril.com/avatar/${name}?width=320&fallback=${env.BASE_URL}/img/fallback-avatar.svg`
                  : '/img/fallback-avatar.svg'
              }
              alt="ZKsync Logo"
              width={160}
              height={160}
              className="w-28 rounded-full object-cover border-6 border-white shadow-[0_0_22px_0_#00000029] md:w-40"
            />

            <div className="space-y-3">
              <h1 className="space-y-3 text-3xl font-bold leading-none lg:text-5xl">
                {name}
              </h1>
              {!name.includes('...') && (
                <div className="flex items-center gap-1.5">
                  <CopyAddressButton address={address} />
                </div>
              )}
            </div>
          </div>

          <Card className="h-fit flex flex-row items-center justify-between gap-10 p-4 w-full md:w-fit">
            <div className="flex flex-col">
              <Typography className="text-sm">Voting Power</Typography>
              <Typography className="font-bold text-xl">
                {bigintToFormattedString(BigInt(delegate.votes ?? 0))} ZK
              </Typography>
            </div>

            <DelegateButton delegate={delegate} />
          </Card>
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
            {delegate.voteCasts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  This account has not voted on any proposals yet.
                </TableCell>
              </TableRow>
            )}

            {delegate.voteCasts.length > 0 &&
              delegate.voteCasts.map(({ proposalId, proposal, support }) => (
                <TableRow key={proposalId} className="group">
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
              ))}
          </TableBody>
        </Table>
      </div>

      <Footer />
    </div>
  )
}
