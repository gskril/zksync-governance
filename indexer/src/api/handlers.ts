import { db } from 'ponder:api'
import type { Address } from 'viem'

export async function getDelegates(limit: number, offset: number) {
  const currentUnitTimestamp = new Date().getTime() / 1000

  const latest5Proposals = await db.query.proposal.findMany({
    orderBy: (cols, { desc }) => [desc(cols.createdAtBlock)],
    where: (cols, { gte }) =>
      gte(cols.startTimestamp, BigInt(Math.floor(currentUnitTimestamp))),
    limit: 5,
  })

  const latest5ProposalIds = latest5Proposals.map((proposal) => proposal.id)

  const delegatesWithVotes = await db.query.account.findMany({
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

  // Insert the missed vote with support -1 only if it is actually missed
  // const delegates = delegatesWithVotes.map((delegate) => {
  //   const voteCasts = latest5ProposalIds.map((proposalId) => {
  //     const voteCast = delegate.voteCasts.find(
  //       (voteCast) => voteCast.proposalId === proposalId
  //     )

  //     return (
  //       voteCast ?? {
  //         proposalId,
  //         support: -1,
  //       }
  //     )
  //   })
  //   return { ...delegate, voteCasts }
  // })

  return {
    latest5Proposals,
    delegates: delegatesWithVotes,
  }
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
