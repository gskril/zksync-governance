import '@rainbow-me/rainbowkit/styles.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { ClientProviders } from '@/components/ClientProviders'
import { IndexerStatus } from '@/components/IndexerStatus'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZKsync Governance',
  description: 'View and vote on proposals in the ZKsync Governance System.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ClientProviders>
          <IndexerStatus />
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
