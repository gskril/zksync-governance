import { useQuery } from '@tanstack/react-query'
import { EnhancedProposalWithVotes } from 'indexer/types'

import { env } from '@/lib/env'

export function useProposal(id: string) {
  return useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      return await getProposal(id)
    },
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
