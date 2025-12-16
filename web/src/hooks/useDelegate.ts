import { GetDelegateResponse } from 'indexer/types'
import { Address } from 'viem'

import { env } from '@/lib/env'

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
