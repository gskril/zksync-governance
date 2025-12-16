import { GetDelegatesResponse } from 'indexer/types'

import { env } from '@/lib/env'

export const DELEGATES_PER_PAGE = 50

type GetDelegatesParams = {
  page: number
  q?: string
}

export async function getDelegates({ page, q }: GetDelegatesParams) {
  const offset = (page - 1) * DELEGATES_PER_PAGE

  const query = new URLSearchParams()
  query.set('offset', offset.toString())
  query.set('limit', DELEGATES_PER_PAGE.toString())
  if (q) {
    query.set('q', q)
  }

  const response = await fetch(
    `${env.PONDER_URL}/delegates?${query.toString()}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch delegates')
  }
  const json = await response.json()
  const data = json as GetDelegatesResponse

  return data
}
