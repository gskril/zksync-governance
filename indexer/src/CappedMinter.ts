import { ponder } from 'ponder:registry'
import { cappedMinter, cappedMinterCreatedEvent } from 'ponder:schema'
import { keccak256, toHex, zeroAddress } from 'viem'

const minterRole = keccak256(toHex('MINTER_ROLE'))

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
      createdAt: Number(event.block.timestamp),
      minted: BigInt(0),
      minter: zeroAddress,
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

ponder.on('CappedMinter:RoleGranted', async ({ event, context }) => {
  if (event.args.role === minterRole) {
    await context.db.update(cappedMinter, { address: event.log.address }).set({
      minter: event.args.account,
    })
  }
})
