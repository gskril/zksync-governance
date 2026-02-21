import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container relative">
      <div className="flex flex-col items-center justify-center text-center py-20">
        <p className="text-7xl font-bold text-brand-primary md:text-9xl">404</p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
          Page not found
        </h1>
        <p className="mt-2 text-zinc-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/" className={buttonVariants({ variant: 'primary' })}>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
