import { Fragment } from 'react'

const links = [
  { href: 'https://www.zksync.io/', label: 'ZKsync' },
  { href: 'https://docs.zknation.io/', label: 'Governance Docs' },
  { href: 'https://x.com/zksync/', label: 'Twitter' },
]

export function Footer() {
  return (
    <footer className="flex justify-center gap-3 text-zinc-600">
      {links.map(({ href, label }, idx) => (
        <Fragment key={href}>
          <a
            href={href}
            target="_blank"
            className="font-medium transition-colors hover:text-brand-primary"
          >
            {label}
          </a>

          {idx < links.length - 1 && <span>/</span>}
        </Fragment>
      ))}
    </footer>
  )
}
