import { Fragment } from 'react'

const links = [
  { href: 'https://www.zksync.io/', label: 'ZKsync' },
  { href: 'https://www.zknation.io/', label: 'ZK Nation' },
  { href: 'https://docs.zknation.io/', label: 'Governance Docs' },
  { href: 'https://forum.zknation.io/', label: 'Forum' },
  { href: 'https://x.com/zksync/', label: 'Twitter' },
  { href: 'https://stats.uptimerobot.com/LEhg80HD39', label: 'Status' },
]

export function Footer() {
  return (
    <footer className="flex justify-center gap-2 sm:gap-3 text-zinc-600 flex-col sm:flex-row items-center">
      {links.map(({ href, label }, idx) => (
        <Fragment key={href}>
          <a
            href={href}
            target="_blank"
            className="font-medium transition-colors hover:text-brand-primary"
          >
            {label}
          </a>

          {idx < links.length - 1 && <span className="hidden sm:block">/</span>}
        </Fragment>
      ))}
    </footer>
  )
}
