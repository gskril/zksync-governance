# ZKsync Governance Web Application

## Overview

This is a Next.js 16 web application for the ZKsync Governance System. It allows users to view and vote on governance proposals, explore delegates, and interact with ZKsync governance contracts.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Package Manager**: bun (use `bun` for all operations, not npm/yarn)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix primitives)
- **Data Fetching**: React Query (@tanstack/react-query)
- **Web3**: wagmi, viem, RainbowKit
- **Hosting**: Vercel

## Project Structure

This is part of a monorepo with three workspaces:
- `web/` - This Next.js frontend
- `indexer/` - Ponder-based blockchain indexer (provides API data)
- `shared/` - Shared contracts and types

### Web App Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home - proposals list
│   ├── client.tsx         # Client component for proposals
│   ├── delegates/
│   │   ├── page.tsx       # Delegates list
│   │   ├── client.tsx     # Client component for delegates
│   │   └── [address]/     # Individual delegate page
│   ├── proposal/
│   │   └── [id]/          # Individual proposal page
│   ├── minters/           # Minters page
│   └── create-proposal/   # Proposal creation
├── components/
│   ├── ui/                # shadcn/ui components
│   └── ...                # Feature components
├── hooks/                 # React Query hooks
│   ├── useProposals.ts
│   ├── useProposal.ts
│   ├── useDelegates.ts
│   └── useDelegate.ts
└── lib/
    ├── env.ts             # Environment variables
    ├── utils.ts           # Utility functions (cn, formatting, etc.)
    ├── web3.ts            # Wagmi config
    └── actions.ts         # Server actions
```

## Data Fetching Pattern

The app uses **client-side data fetching with React Query** instead of ISR/server-side rendering:

```tsx
// In hooks (e.g., useProposals.ts)
export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => await getProposals(),
  })
}

// In client components
const { data, isLoading } = useProposals()
```

Pages wrap client components in `<Suspense>` for `useSearchParams()` compatibility:

```tsx
// In page.tsx
<Suspense fallback={<TableSkeleton />}>
  <ClientComponent />
</Suspense>
```

## Environment Variables

Required env vars (see `src/lib/env.ts`):
- `NEXT_PUBLIC_PONDER_URL` - Indexer API URL
- `NEXT_PUBLIC_ZKSYNC_RPC_URL` - ZKsync RPC endpoint
- `NEXT_PUBLIC_ZKSYNC_RPC_URL_FALLBACK` - Fallback RPC (optional)
- `NEXT_PUBLIC_ETH_RPC_URL` - Ethereum RPC endpoint
- `NEXT_PUBLIC_ETH_RPC_URL_FALLBACK` - Fallback RPC (optional)
- `NEXT_PUBLIC_WALLETCONNECT_ID` - WalletConnect project ID
- `NEXT_PUBLIC_BASE_URL` - Base URL for the app (optional)

## Key Concepts

### Governors
Three governance contracts (defined in `shared/contracts`):
- Token Governor (`ZkTokenGovernor`)
- Protocol Governor (`ZkProtocolGovernor`)
- GovOps Governor (`ZkGovOpsGovernor`)

### Proposals
Proposals have statuses: `active`, `pending`, `succeeded`, `queued`, `executed`, `defeated`, `canceled`, `expired`

### Delegates
Users can delegate their voting power. The delegates page shows:
- Voting power (ZK tokens)
- Vote history (last 5 votes as colored dots)
- Pagination (50 per page)

## Commands

```bash
# Development
bun dev              # or: bun --filter=web run dev

# Build
bun run build

# Start production
bun start
```

## Styling Conventions

- Use `cn()` utility for conditional classNames (from `@/lib/utils`)
- Tailwind classes follow mobile-first responsive design
- Brand colors: `brand-primary`, `brand-green`, `brand-red`, `brand-freedom-blue`
- Shadow utility: `shadow-custom-card`

## Component Patterns

### Skeleton Loading
Each data table has a corresponding skeleton component:
```tsx
function RowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
    </TableRow>
  )
}

export function TableSkeleton() {
  return (
    <Table>
      <TableBody>
        {Array.from({ length: 10 }).map((_, i) => <RowSkeleton key={i} />)}
      </TableBody>
    </Table>
  )
}
```

### Client Components
- Mark with `'use client'` directive
- Use React Query hooks for data fetching
- Handle loading states with `isLoading` from hooks

## API

Data comes from the indexer at `PONDER_URL`:
- `GET /proposals` - List all proposals
- `GET /proposals/:id` - Single proposal with votes
- `GET /delegates?offset=&limit=&q=` - Paginated delegates list
- `GET /delegates/:address` - Single delegate details

## Notes

- The app was refactored from ISR to client-side fetching to reduce Vercel usage costs
- Use Suspense with skeleton fallbacks to prevent layout flash on page load

### Proposal Page Architecture

The `/proposal/[id]` page uses a hybrid approach:

**Server-rendered (cached forever with `revalidate = false`):**
- Title
- Proposer info
- Description/body (markdown content)
- Executable code tab

Pages are generated on-demand when first visited and cached indefinitely. New proposals automatically get pages created when accessed.

**Client-side (loaded via React Query):**
- Status badge and end timestamp
- Vote/Queue/Execute action buttons
- Votes panel (vote bars, quorum, voter list)

This keeps static content (title, description) cached forever while dynamic content (status, votes) loads fresh on each visit.

### Delegate Page Architecture

The `/delegates/[address]` page uses the same hybrid approach:

**Server-rendered (cached forever with `revalidate = false`):**
- Page shell (Nav, Footer)
- Metadata (title, description) with ENS name lookup

Pages are generated on-demand when first visited and cached indefinitely.

**Client-side (loaded via React Query):**
- Delegate header (ENS name, avatar)
- Voting power card with delegate button
- Voting history table

This keeps the page shell cached while dynamic delegate data loads fresh on each visit.
