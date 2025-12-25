import { Metadata } from 'next'

import { Footer } from '@/components/Footer'
import { MintersTable } from '@/components/MintersTable'
import { Nav } from '@/components/Nav'
import { getMinters } from '@/hooks/useMinters'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Capped Minters',
  description:
    'Unique smart contracts in the ZKsync ecosystem that allow for just-in-time minting of ERC-20 tokens.',
}

export default async function MintersPage() {
  const minters = await getMinters().catch((error) => {
    console.error(error)
    return []
  })

  return (
    <div className="container relative">
      <Nav />

      <div className="mb-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:gap-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <img
              src="/img/logo-filled-dark.svg"
              alt="ZKsync Logo"
              width={160}
              height={160}
              className="w-28 -rotate-3 rounded-3xl border-6 border-white shadow-[0_0_22px_0_#00000029] md:w-40"
            />

            <div className="space-y-3">
              <h1>
                <span className="block text-3xl font-bold leading-none lg:text-5xl">
                  Capped Minters
                </span>
              </h1>
              <span className="text-sm text-zinc-500">
                {metadata.description}
              </span>
            </div>
          </div>
        </div>
      </div>

      <MintersTable minters={minters} />

      <Footer />
    </div>
  )
}
