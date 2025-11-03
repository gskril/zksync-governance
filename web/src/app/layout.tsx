import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/ClientProviders'
import { IndexerStatus } from '@/components/IndexerStatus'

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
      <ClientProviders>
        <IndexerStatus />

        <body className={`${inter.className} antialiased`}>{children}</body>
      </ClientProviders>
    </html>
  )
}
