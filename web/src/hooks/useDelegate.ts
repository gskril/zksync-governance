import { useQuery } from '@tanstack/react-query'
import { GetDelegateResponse } from 'indexer/types'
import { Address } from 'viem'

import { env } from '@/lib/env'

export function useDelegate(address: Address) {
  return useQuery({
    queryKey: ['delegate', address],
    queryFn: async () => {
      return await getDelegate(address)
    },
    staleTime: 1000 * 30, // 30 seconds - delegate data changes infrequently
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export async function getDelegate(address: Address) {
  const path = `/delegates/${address}`
  const url = new URL(path, env.PONDER_URL).toString()

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch delegate')
  }
  const json = await response.json()
  const data = json as GetDelegateResponse

  return data
}
