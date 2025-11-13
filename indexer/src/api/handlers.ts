import { db } from 'ponder:api'
import type { Address } from 'viem'

export async function getDelegates(limit: number, offset: number) {
  const latest5Proposals = await db.query.proposal.findMany({
    orderBy: (cols, { desc }) => [desc(cols.createdAtBlock)],
    limit: 5,
  })

  const latest5ProposalIds = latest5Proposals.map((proposal) => proposal.id)

  return db.query.account.findMany({
    limit,
    offset,
    orderBy: (cols, { desc }) => [desc(cols.votes)],
    where: (cols, { isNotNull }) => isNotNull(cols.votes),
    with: {
      voteCasts: {
        orderBy: (cols, { desc }) => [desc(cols.timestamp)],
        where: (cols, { inArray }) =>
          inArray(cols.proposalId, latest5ProposalIds),
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
