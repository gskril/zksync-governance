import { db } from 'ponder:api'
import type { Address } from 'viem'

export async function getDelegates(limit: number, offset: number) {
  const currentUnitTimestamp = new Date().getTime() / 1000

  const latest5Proposals = await db.query.proposal.findMany({
    orderBy: (cols, { desc }) => [desc(cols.createdAtBlock)],
    where: (cols, { lte }) =>
      lte(cols.startTimestamp, BigInt(Math.floor(currentUnitTimestamp))),
    limit: 5,
  })

  const latest5ProposalIds = latest5Proposals.map((proposal) => proposal.id)

  const delegatesWithVotes = await db.query.account.findMany({
    limit,
    offset,
    orderBy: (cols, { desc }) => [desc(cols.votes)],
    where: (cols, { isNotNull }) => isNotNull(cols.votes),
    with: {
      // TODO: Add filter for efficiency
      voteCasts: {
        orderBy: (cols, { desc }) => [desc(cols.timestamp)],
        limit: 5,
      },
    },
  })

  // Insert the missed vote with support -1 only if it is actually missed
  // Account for number precision loss at some point (idk why or where)
  const delegates = delegatesWithVotes.map((delegate) => {
    const voteCasts = latest5ProposalIds.map((proposalId) => {
      const voteCast = delegate.voteCasts.find(
        (voteCast) =>
          voteCast.proposalId.toString().slice(0, 16) ===
          proposalId.toString().slice(0, 16)
      )

      return (
        voteCast ?? {
          proposalId,
          support: -1,
        }
      )
    })
    return { ...delegate, voteCasts }
  })

  return delegates
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
