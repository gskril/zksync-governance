import { replaceBigInts } from '@ponder/utils'
import { Hono } from 'hono'
import { graphql } from 'ponder'
import { db } from 'ponder:api'
import schema from 'ponder:schema'
import { getAddress, parseUnits } from 'viem'

import { getPropQuorumReached } from '../utils'
import { getPropStatus } from '../utils'
import { getDelegate, getDelegates } from './handlers'

const app = new Hono()

app.use('/', graphql({ db, schema }))
app.use('/graphql', graphql({ db, schema }))

app.get('/proposals', async (c) => {
  const props = await db.query.proposal.findMany({
    orderBy: (table, { desc }) => [desc(table.createdAtBlock)],
  })

  if (!props) {
    return c.json({ error: 'Proposals not found' }, 404)
  }

  const propsWithStatus = props.map((prop) => {
    const status = getPropStatus(prop)
    const quorumReached = getPropQuorumReached(prop)
    return { status, quorumReached, ...prop }
  })

  return c.json(replaceBigInts(propsWithStatus, (v) => String(v)))
})

// TODO: Implement pagination of voters
app.get('/proposals/:proposalId', async (c) => {
  const proposalId = c.req.param('proposalId')
  const prop = await db.query.proposal.findFirst({
    where: (cols, { eq }) => eq(cols.id, BigInt(proposalId)),
    with: {
      votes: {
        orderBy: (cols, { desc }) => [desc(cols.weight)],
        where: (cols, { gte }) => gte(cols.weight, parseUnits('5000', 18)),
      },
    },
  })

  if (!prop) {
    return c.json({ error: 'Proposal not found' }, 404)
  }

  const status = getPropStatus(prop)
  const quorumReached = getPropQuorumReached(prop)

  const top50Delegates = await db.query.account.findMany({
    limit: 50,
    orderBy: (cols, { desc }) => [desc(cols.votes)],
    where: (cols, { isNotNull }) => isNotNull(cols.votes),
  })

  const didntVote = top50Delegates.filter((delegate) => {
    return !prop.votes.some((vote) => vote.voter === delegate.address)
  })

  const enhancedProposal = replaceBigInts(
    {
      status,
      quorumReached,
      didntVote,
      ...prop,
    },
    (v) => String(v)
  )

  return c.json(enhancedProposal)
})

app.get('/delegates', async (c) => {
  const limit = 50
  const offset = Number(c.req.query('offset')) ?? 0

  const delegates = await getDelegates(limit, offset)
  return c.json(replaceBigInts(delegates, (v) => String(v)))
})

app.get('/delegates/:address', async (c) => {
  const address = getAddress(c.req.param('address'))
  const delegate = await getDelegate(address)
  if (!delegate) {
    return c.json({ error: 'Delegate not found' }, 404)
  }
  return c.json(replaceBigInts(delegate, (v) => String(v)))
})

export default app
