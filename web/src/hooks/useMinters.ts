import type { Minter } from 'indexer/types'

import { env } from '@/lib/env'

const query = `
  {
    cappedMinters(
      limit: 100
      orderBy: "createdAt"
      orderDirection: "desc"
    ) {
      totalCount
      items {
        address
        admin
        cap
        createdAt
        expirationTime
        minter
        mintable
        minted
        startTime
      }
    }
  }
`

export async function getMinters() {
  const response = await fetch(`${env.PONDER_URL}/graphql`, {
    method: 'POST',
    body: JSON.stringify({ query }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch minters')
  }

  const json = await response.json()
  const { data } = json as {
    data: {
      cappedMinters: {
        totalCount: number
        items: Minter[]
      }
    }
  }

  const { totalCount, items } = data.cappedMinters

  if (totalCount > 100) {
    console.warn(`Total minters is greater than 100: ${totalCount}`)
  }

  return items
}
