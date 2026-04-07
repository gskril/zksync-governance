import { useQuery } from '@tanstack/react-query'
import { EnhancedProposalWithVotes } from 'indexer/types'

import { env } from '@/lib/env'

export function useProposal(id: string) {
  return useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      return await getProposal(id)
    },
    staleTime: 1000 * 15, // 15 seconds - votes can change frequently for active proposals
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true, // Refetch on focus for real-time vote updates
    retry: 2,
  })
}

export async function getProposal(id: string) {
  const path = `/proposals/${id}`
  const url = new URL(path, env.PONDER_URL).toString()

  const response = await fetch(url)
  if (!response.ok) {
    console.error('Failed to fetch proposal', response)
    return null
  }
  const json = await response.json()
  const data = json as EnhancedProposalWithVotes

  return data
}
