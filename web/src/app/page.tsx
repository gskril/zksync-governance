import Image from 'next/image'
import { Suspense } from 'react'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { getProposals } from '@/hooks/useProposals'

import { ProposalsClient } from './client'

// Serve from cache but revalidate every 60 seconds (ISR)
export const revalidate = 60

export default async function Home() {
  const proposals = await getProposals().catch(() => [])

  return (
    <div className="container relative">
      <Nav />

      <div className="mb-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:gap-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Image
              src="/img/logo-filled.svg"
              alt="ZKsync Logo"
              width={160}
              height={160}
              className="w-28 -rotate-3 rounded-3xl border-6 border-white shadow-[0_0_22px_0_#00000029] md:w-40"
            />

            <div className="space-y-3">
              <h1 className="space-y-2">
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

      <Suspense fallback={null}>
        <ProposalsClient proposals={proposals} />
      </Suspense>

      <Footer />
    </div>
  )
}
