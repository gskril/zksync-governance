import { Metadata } from 'next'
import Image from 'next/image'
import { Suspense } from 'react'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'

import { DelegatesClient, DelegatesTableSkeleton } from './client'

export const metadata: Metadata = {
  title: 'ZKsync Delegates',
  description: 'View the delegates of the ZKsync Governance System.',
}

export default function Delegates() {
  return (
    <div className="container relative">
      <Nav />

      <div className="mb-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:gap-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Image
              src="/img/logo-filled-dark.svg"
              alt="ZKsync Logo"
              width={160}
              height={160}
              className="w-28 -rotate-3 rounded-3xl border-6 border-white shadow-[0_0_22px_0_#00000029] md:w-40"
            />

            <div className="space-y-2">
              <h1 className="space-y-2">
                <span className="line block text-2xl font-bold leading-none text-brand-primary">
                  ZKsync
                </span>{' '}
                <span className="block text-3xl font-bold leading-none lg:text-5xl">
                  Delegates
                </span>
              </h1>
              <span className="text-sm text-zinc-500">Quorum: 630M</span>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<DelegatesTableSkeleton />}>
        <DelegatesClient />
      </Suspense>

      <Footer />
    </div>
  )
}
