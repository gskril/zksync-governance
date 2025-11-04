import { db } from 'ponder:api'

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
