import { ponder } from 'ponder:registry'
import { cappedMinter, cappedMinterCreatedEvent } from 'ponder:schema'

ponder.on(
  'CappedMinterFactory:CappedMinterV2Created',
  async ({ event, context }) => {
    await context.db.insert(cappedMinterCreatedEvent).values({
      id: event.id,
      timestamp: event.block.timestamp,
      minter: event.args.minterAddress,
    })

    await context.db.insert(cappedMinter).values({
      ...event.args,
      address: event.args.minterAddress,
      createdAt: event.block.timestamp,
      minted: BigInt(0),
    })
  }
)

ponder.on('CappedMinter:Minted', async ({ event, context }) => {
  await context.db
    .update(cappedMinter, { address: event.log.address })
    .set((cols) => ({
      minted: cols.minted + event.args.amount,
    }))
})
