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
