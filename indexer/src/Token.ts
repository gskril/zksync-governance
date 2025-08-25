import { ponder } from 'ponder:registry'
import {
  account,
  delegateChangedEvent,
  delegateVotesChangedEvent,
} from 'ponder:schema'

ponder.on('Token:DelegateChanged', async ({ event, context }) => {
  await context.db.insert(delegateChangedEvent).values({
    ...event.args,
    id: event.id,
    timestamp: event.block.timestamp,
  })

  await context.db
    .insert(account)
    .values({
      address: event.args.delegator,
      delegate: event.args.toDelegate,
    })
    .onConflictDoUpdate({
      delegate: event.args.toDelegate,
    })

  await context.db
    .insert(account)
    .values({
      address: event.args.toDelegate,
    })
    .onConflictDoNothing()
})

// Fires after `DelegateChanged`
ponder.on('Token:DelegateVotesChanged', async ({ event, context }) => {
  await context.db.insert(delegateVotesChangedEvent).values({
    ...event.args,
    id: event.id,
    timestamp: event.block.timestamp,
  })

  await context.db.update(account, { address: event.args.delegate }).set({
    votes: event.args.newBalance,
  })
})
