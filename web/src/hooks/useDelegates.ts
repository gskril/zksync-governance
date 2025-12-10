import { env } from '@/lib/env'
import { GetDelegatesResponse } from 'indexer/types'

export const DELEGATES_PER_PAGE = 50

export async function getDelegates(page: number = 1) {
  const offset = (page - 1) * DELEGATES_PER_PAGE
  const path = `/delegates?offset=${offset}&limit=${DELEGATES_PER_PAGE}`
  const url = new URL(path, env.PONDER_URL).toString()

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch delegates')
  }
  const json = await response.json()
  const data = json as GetDelegatesResponse

  return data
}
