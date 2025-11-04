import { onchainTable, relations } from 'ponder'

export const proposal = onchainTable('proposal', (t) => ({
  id: t.bigint().primaryKey(),
  title: t.text().notNull(),
  createdAtBlock: t.bigint().notNull(),
  createdAtTimestamp: t.bigint().notNull(),
  queuedAtTimestamp: t.bigint(),
  executedAtTimestamp: t.bigint(),
  canceledAtTimestamp: t.bigint(),
  quorum: t.bigint().notNull(),
  forVotes: t.bigint().notNull(),
  againstVotes: t.bigint().notNull(),
  abstainVotes: t.bigint().notNull(),
  createTransaction: t.hex().notNull(),
  executeTransaction: t.hex(),
  descriptionHash: t.hex().notNull(),
  governor: t.hex().notNull(),
  summary: t.text(),

  // Raw from contract
  proposer: t.hex().notNull(),
  targets: t.jsonb().notNull(),
  values: t.jsonb().notNull(),
  signatures: t.jsonb().notNull(),
  calldatas: t.jsonb().notNull(),
  startTimestamp: t.bigint().notNull(),
  endTimestamp: t.bigint().notNull(),
  description: t.text().notNull(),
}))

export const proposalRelations = relations(proposal, ({ many }) => ({
  votes: many(voteCastEvent),
}))

export const proposalCanceledEvent = onchainTable(
  'proposalCanceledEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint().notNull(),
    proposalId: t.bigint().notNull(),
  })
)

export const proposalCreatedEvent = onchainTable(
  'proposalCreatedEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint().notNull(),
    proposalId: t.bigint().notNull(),
    proposer: t.hex().notNull(),
    targets: t.jsonb().notNull(),
    values: t.jsonb().notNull(),
    signatures: t.jsonb().notNull(),
    calldatas: t.jsonb().notNull(),
    voteStart: t.bigint().notNull(),
    voteEnd: t.bigint().notNull(),
    description: t.text().notNull(),
  })
)

export const proposalExtendedEvent = onchainTable(
  'proposalExtendedEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint().notNull(),
    proposalId: t.bigint().notNull(),
    extendedDeadline: t.bigint().notNull(),
  })
)

export const proposalExecutedEvent = onchainTable(
  'proposalExecutedEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint().notNull(),
    transaction: t.hex().notNull(),
    proposalId: t.bigint().notNull(),
  })
)

export const proposalQueuedEvent = onchainTable('proposalQueuedEvent', (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.bigint().notNull(),
  proposalId: t.bigint().notNull(),
  eta: t.bigint().notNull(),
}))

export const timelockChangeEvent = onchainTable('timelockChangeEvent', (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.bigint().notNull(),
  oldTimelock: t.hex().notNull(),
  newTimelock: t.hex().notNull(),
}))

export const voteCastEvent = onchainTable('voteCastEvent', (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.bigint().notNull(),
  transaction: t.hex().notNull(),
  voter: t.hex().notNull(),
  proposalId: t.bigint().notNull(),
  support: t.integer().notNull(),
  weight: t.bigint().notNull(),
  reason: t.text().notNull(),
}))

export const voteCastEventRelations = relations(voteCastEvent, ({ one }) => ({
  proposal: one(proposal, {
    fields: [voteCastEvent.proposalId],
    references: [proposal.id],
  }),
}))

export const account = onchainTable('account', (t) => ({
  address: t.hex().primaryKey(),
  delegate: t.hex(),
  votes: t.bigint(),
}))

export const delegateChangedEvent = onchainTable(
  'delegateChangedEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint().notNull(),
    delegator: t.hex().notNull(),
    fromDelegate: t.hex().notNull(),
    toDelegate: t.hex().notNull(),
  })
)

export const delegateVotesChangedEvent = onchainTable(
  'delegateVotesChangedEvent',
  (t) => ({
    id: t.text().primaryKey(),
    timestamp: t.bigint().notNull(),
    delegate: t.hex().notNull(),
    previousBalance: t.bigint().notNull(),
    newBalance: t.bigint().notNull(),
  })
)
