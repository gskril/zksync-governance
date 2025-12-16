import { Metadata } from 'next'

import { CreateProposalClient } from './client'

export const metadata: Metadata = {
  title: 'Create a ZKsync Governance Proposal',
}

export default function CreateProposalPage() {
  return <CreateProposalClient />
}
