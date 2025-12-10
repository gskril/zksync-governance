import { env } from '@/lib/env'
import { useQuery } from '@tanstack/react-query'
import { EnhancedProposal } from 'indexer/types'
import { Address } from 'viem'

export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    refetchInterval: 5000,
    queryFn: async () => {
      return await getProposals()
    },
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
  const json = await response.json()
  const data = json as EnhancedProposal[]

  return data
}
