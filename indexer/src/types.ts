import type { Hex } from 'viem'

import {
  account,
  cappedMinter,
  proposal,
  voteCastEvent,
} from '../ponder.schema'
import type { getDelegate, getDelegates } from './api/handlers'

export type Status =
  | 'pending'
  | 'active'
  | 'canceled'
  | 'defeated'
  | 'succeeded'
  | 'queued'
  | 'executed'
  | 'expired'

type ReplaceBigInts<T> = T extends bigint
  ? string
  : T extends Array<infer U>
    ? Array<ReplaceBigInts<U>>
    : T extends object
      ? { [K in keyof T]: ReplaceBigInts<T[K]> }
      : T

export type EnhancedProposal = ReplaceBigInts<typeof proposal.$inferSelect> & {
  status: Status
  quorumReached: boolean

  // Correct unknown types
  values: string[]
  targets: Hex[]
  signatures: Hex[]
  calldatas: Hex[]
}

export type EnhancedProposalWithVotes = EnhancedProposal & {
  votes: ReplaceBigInts<(typeof voteCastEvent.$inferSelect)[]>
  didntVote: ReplaceBigInts<typeof account.$inferSelect>[]
}

export type GetDelegatesResponse = ReplaceBigInts<
  Awaited<ReturnType<typeof getDelegates>>
>

export type GetDelegateResponse = ReplaceBigInts<
  Awaited<ReturnType<typeof getDelegate>>
>

export type Minter = ReplaceBigInts<typeof cappedMinter.$inferSelect>
