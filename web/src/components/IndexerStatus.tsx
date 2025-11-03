'use client'

import { env } from '@/lib/env'
import { useQuery } from '@tanstack/react-query'

const url = new URL('/status', env.PONDER_URL).toString()

export function IndexerStatus() {
  const { data } = useQuery({
    queryKey: ['indexer-status'],
    refetchInterval: 5000,
    queryFn: async () => {
      const res = await fetch(url)
      const json = (await res.json()) as {
        zkSync: {
          id: number
          block: {
            number: number
            timestamp: number
          }
        }
      }

      const currentTimestamp = Math.floor(Date.now() / 1000)

      // Check if the current timestamp is within 30 seconds of the block timestamp
      const isReady = currentTimestamp - json.zkSync.block.timestamp < 30

      return { isReady, status: json }
    },
  })

  const { isReady, status } = data ?? {}

  if (status && !isReady) {
    return (
      <div className="w-full bg-primary-brand/5 p-2 text-center text-sm">
        <span>
          Data is being indexed... Currently at{' '}
          {new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'medium',
          }).format(new Date(status.zkSync.block.timestamp * 1000))}
        </span>
      </div>
    )
  }
}
