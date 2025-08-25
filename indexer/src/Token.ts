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
})

ponder.on('Token:DelegateVotesChanged', async ({ event, context }) => {
  await context.db.insert(delegateVotesChangedEvent).values({
    ...event.args,
    id: event.id,
    timestamp: event.block.timestamp,
  })

  await context.db
    .insert(account)
    .values({
      address: event.args.delegate,
      votes: event.args.newBalance,
    })
    // Sometimes this event can be emitted without `DelegateChanged`
    .onConflictDoUpdate({
      votes: event.args.newBalance,
    })
})
