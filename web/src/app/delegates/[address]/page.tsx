import { Metadata } from 'next'
import { delegateNames } from 'shared'
import { Address } from 'viem'
import { getPublicClient } from 'wagmi/actions'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { truncateAddress } from '@/lib/utils'
import { wagmiConfigForServer } from '@/lib/web3-server'

import { DelegateHeader, VotingHistoryTable, VotingPowerCard } from './client'

// Cache forever once generated, generate new pages on-demand
export const revalidate = false
export const dynamicParams = true

async function getDelegateName(address: Address) {
  let name: string | null | undefined

  name = delegateNames[address]

  if (!name) {
    try {
      const client = getPublicClient(wagmiConfigForServer, { chainId: 1 })
      name = await client.getEnsName({ address })
    } catch {
      // ENS lookup failed, use truncated address
    }
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

  return (
    <div className="container">
      <Nav />

      <div className="mb-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:gap-12 items-center">
          <DelegateHeader address={address} />
          <VotingPowerCard address={address} />
        </div>
      </div>

      <VotingHistoryTable address={address} />

      <Footer />
    </div>
  )
}
