import { db } from 'ponder:api'
import type { Address } from 'viem'

export async function getDelegates(limit: number, offset: number) {
  return db.query.account.findMany({
    limit,
    offset,
    orderBy: (cols, { desc }) => [desc(cols.votes)],
    where: (cols, { isNotNull }) => isNotNull(cols.votes),
    with: {
      voteCasts: {
        orderBy: (cols, { desc }) => [desc(cols.timestamp)],
        limit: 5,
      },
    },
  })
}

export async function getDelegate(address: Address) {
  return db.query.account.findFirst({
    where: (cols, { eq }) => eq(cols.address, address),
    with: {
      voteCasts: {
        orderBy: (cols, { desc }) => [desc(cols.timestamp)],
        with: {
          proposal: true,
        },
      },
    },
  })
}
