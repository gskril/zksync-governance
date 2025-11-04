import Link from 'next/link'
import { ConnectButton } from './ConnectButton'

const links = [
  { href: '/', label: 'Proposals' },
  { href: '/proposals', label: 'Delegates' },
  { href: '/create-proposal', label: 'New Proposal' },
]

export function Nav() {
  return (
    <nav className="flex justify-end gap-x-6 items-center">
      <div className="flex gap-x-6">
        {links.map(({ href, label }) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </div>

      <ConnectButton />
    </nav>
  )
}
