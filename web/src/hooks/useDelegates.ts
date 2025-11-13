import { env } from '@/lib/env'
import { GetDelegatesResponse } from 'indexer/types'

export async function getDelegates() {
  const path = `/delegates`
  const url = new URL(path, env.PONDER_URL).toString()

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch delegates')
  }
  const json = await response.json()
  const data = json as GetDelegatesResponse

  return data
}
