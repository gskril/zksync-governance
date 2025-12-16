import { db, publicClients } from 'ponder:api'
import { delegateNames } from 'shared'
import { type Address, isAddress } from 'viem'

type GetDelegatesParams = {
  limit: number
  offset: number
  q?: string
}

export async function getDelegates({
  limit,
  offset,
  q: _q,
}: GetDelegatesParams) {
  const currentUnitTimestamp = new Date().getTime() / 1000

  const latest5Proposals = await db.query.proposal.findMany({
    orderBy: (cols, { desc }) => [desc(cols.createdAtBlock)],
    where: (cols, { lte }) =>
      lte(cols.startTimestamp, BigInt(Math.floor(currentUnitTimestamp))),
    limit: 5,
  })

  const latest5ProposalIds = latest5Proposals.map((proposal) => proposal.id)

  let delegatesWithoutVotes

  if (_q) {
    let q: Address | undefined

    if (isAddress(_q)) {
      q = _q
    } else if (_q.includes('.') && _q.length > 3) {
      // ENS lookup
      const address = await publicClients['mainnet'].getEnsAddress({ name: _q })
      if (address) {
        q = address
      }
    } else {
      // Manual name lookup
      const manualName = Object.entries(delegateNames).find(
        ([_, name]) => name.toLowerCase() === _q.toLowerCase()
      )
      if (manualName) {
        q = manualName[0] as Address
      }
    }

    if (!q) {
      return []
    }

    delegatesWithoutVotes = await db.query.account.findMany({
      limit,
      offset,
      orderBy: (cols, { desc }) => [desc(cols.votes)],
      where: (cols, { eq }) => eq(cols.address, q),
    })
  } else {
    delegatesWithoutVotes = await db.query.account.findMany({
      limit,
      offset,
      orderBy: (cols, { desc }) => [desc(cols.votes)],
      where: (cols, { isNotNull }) => isNotNull(cols.votes),
    })
  }

  const votes = await db.query.voteCastEvent.findMany({
    where: (cols, { inArray, and }) =>
      and(
        inArray(cols.proposalId, latest5ProposalIds),
        inArray(
          cols.voter,
          delegatesWithoutVotes.map((delegate) => delegate.address)
        )
      ),
  })

  const delegatesWithVotes = delegatesWithoutVotes.map((delegate) => {
    const voteCasts = votes.filter((vote) => vote.voter === delegate.address)
    return { ...delegate, voteCasts }
  })

  // Insert the missed vote with support -1 only if it is actually missed
  // Account for number precision loss at some point (idk why or where)
  const delegates = delegatesWithVotes.map((delegate) => {
    const voteCasts = latest5ProposalIds.map((proposalId) => {
      const voteCast = delegate.voteCasts.find(
        (voteCast) => voteCast.proposalId === proposalId
      )

      // Workaround for Ponder's precision loss bug
      if (voteCast) {
        voteCast.proposalId = proposalId
        return voteCast
      }

      return {
        proposalId,
        support: -1,
      }
    })
    return { ...delegate, voteCasts }
  })

  return delegates
}

export async function getDelegate(address: Address) {
  // We can't use the relationship here with `voteCasts` due to a Ponder precision loss bug
  const delegate = await db.query.account.findFirst({
    where: (cols, { eq }) => eq(cols.address, address),
  })

  const voteCasts = await db.query.voteCastEvent.findMany({
    where: (cols, { eq }) => eq(cols.voter, address),
    orderBy: (cols, { desc }) => [desc(cols.proposalStartTimestamp)],
    with: {
      proposal: true,
    },
  })

  if (!delegate) {
    return null
  }

  return {
    ...delegate,
    voteCasts,
  }
}
