import { type ClassValue, clsx } from 'clsx'
import {
  ZkGovOpsGovernor,
  ZkProtocolGovernor,
  ZkTokenGovernor,
} from 'indexer/contracts'
import { EnhancedProposal } from 'indexer/types'
import { twMerge } from 'tailwind-merge'
import { Address, getAddress } from 'viem'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(
  timestamp: string,
  options: { includeTime?: boolean; includeYear?: boolean } = {
    includeTime: false,
    includeYear: true,
  }
) {
  const date = new Date(Number(timestamp) * 1000)
  const isCurrentYear = date.getFullYear() === new Date().getFullYear()

  const base = date.toLocaleDateString('en-US', {
    year: options?.includeYear && !isCurrentYear ? 'numeric' : undefined,
    month: 'short',
    day: 'numeric',
  })

  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  })

  if (options?.includeTime) {
    return `${base} at ${time}`
  }

  return base
}

export function getTotalVotes(proposal: EnhancedProposal) {
  return (
    BigInt(proposal.forVotes) +
    BigInt(proposal.againstVotes) +
    BigInt(proposal.abstainVotes)
  )
}

export function bigintToFormattedString(
  count: bigint | string,
  { millions = false } = {}
) {
  // If millions is true, always show the number with an M like 0.01M instead of 10K
  if (millions) {
    const string = `${(parseVotes(count) / 1000000).toFixed(2)}M`.replace(
      '.00',
      ''
    )
    // Add commas
    return string.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(parseVotes(count))
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function nameWithFallback(
  name: string | undefined | null,
  address: Address
) {
  if (name) {
    return name.length > 25 ? `${name.slice(0, 25)}...` : name
  }

  return truncateAddress(address)
}

export function getQuorumProgress(proposal: EnhancedProposal) {
  const forVotes = parseVotes(proposal.forVotes)
  const quorum = parseVotes(proposal.quorum)

  const countedVotes = forVotes
  const progress = (countedVotes / quorum) * 100

  return Number(progress.toFixed(2))
}

export function getPercentageOfTotalVotes(
  numerator: string,
  proposal: EnhancedProposal
) {
  const againstVotes = parseVotes(proposal.againstVotes)
  const forVotes = parseVotes(proposal.forVotes)
  const abstainVotes = parseVotes(proposal.abstainVotes)
  const totalVotes = againstVotes + forVotes + abstainVotes
  const num = parseVotes(numerator)

  if (totalVotes === 0) {
    return 0
  }

  const percentage = (num / totalVotes) * 100
  return Math.floor(percentage)
}

/**
 * @param votes (Stringified) bigint of the unformatted votes
 * @returns Votes in a formatted number
 */
export function parseVotes(votes: string | bigint): number {
  return Number(BigInt(votes) / BigInt(1e18))
}

export const GOVERNORS = new Map<Address, string>([
  [ZkTokenGovernor.address, 'Token Governor'],
  [ZkProtocolGovernor.address, 'Protocol Governor'],
  [ZkGovOpsGovernor.address, 'GovOps Governor'],
])

export function getGovernorName(address: Address) {
  return GOVERNORS.get(getAddress(address)) ?? 'Unknown Governor'
}
