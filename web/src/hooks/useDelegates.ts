import { useQuery } from '@tanstack/react-query'
import { GetDelegatesResponse } from 'indexer/types'

import { env } from '@/lib/env'

export const DELEGATES_PER_PAGE = 50

type GetDelegatesParams = {
  page: number
  q?: string
}

export function useDelegates({ page, q }: GetDelegatesParams) {
  return useQuery({
    queryKey: ['delegates', page, q],
    queryFn: async () => {
      return await getDelegates({ page, q })
    },
    staleTime: 1000 * 60, // 1 minute - delegate list relatively static
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export async function getDelegates({ page, q }: GetDelegatesParams) {
  const offset = (page - 1) * DELEGATES_PER_PAGE

  const query = new URLSearchParams()
  query.set('offset', offset.toString())
  query.set('limit', DELEGATES_PER_PAGE.toString())
  if (q) {
    query.set('q', q)
  }

  try {
    const response = await fetch(
      `${env.PONDER_URL}/delegates?${query.toString()}`
    )
    const json = await response.json()
    const data = json as GetDelegatesResponse

    return data
  } catch (error) {
    console.error('Failed to fetch delegates', error)
    return []
  }
}
