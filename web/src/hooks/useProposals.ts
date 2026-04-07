import { useQuery } from '@tanstack/react-query'
import { EnhancedProposal } from 'indexer/types'
import { Address } from 'viem'

import { env } from '@/lib/env'

export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      return await getProposals()
    },
    staleTime: 1000 * 30, // 30 seconds - proposals data is relatively static
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

type ProposalsArgs = {
  governor?: Address
}

export async function getProposals({ governor }: ProposalsArgs = {}) {
  const path = '/proposals'
  const queryParams = new URLSearchParams()
  if (governor) {
    queryParams.set('governor', governor)
  }
  const url =
    new URL(path, env.PONDER_URL).toString() + '?' + queryParams.toString()

  const response = await fetch(url)

  try {
    const json = await response.json()
    const data = json as EnhancedProposal[]

    return data
  } catch (error) {
    console.error('Failed to fetch proposals', error)
    return []
  }
}
