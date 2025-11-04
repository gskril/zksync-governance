'use client'

import Link from 'next/link'
import { ConnectButton } from './ConnectButton'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Proposals' },
  { href: '/delegates', label: 'Delegates' },
  { href: '/create-proposal', label: 'New Proposal' },
]

export function Nav() {
  // Get the current path
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href

  return (
    <nav className="flex justify-end gap-x-6 items-center">
      <div className="flex gap-x-6">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(isActive(href) && 'text-brand-primary')}
          >
            {label}
          </Link>
        ))}
      </div>

      <ConnectButton />
    </nav>
  )
}
