'use client'

import { EnhancedProposal } from 'indexer/types'
import { CircleAlert } from 'lucide-react'
import { useEffect } from 'react'
import { ZkTokenGovernor as GovernorContract } from 'shared/contracts'
import {
  useAccount,
  useBlockNumber,
  useChainId,
  useReadContracts,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { zksync } from 'wagmi/chains'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import revalidateProposal from '@/lib/actions'
import { bigintToFormattedString } from '@/lib/utils'

import { Alert, AlertDescription, AlertTitle } from './ui/alert'

export function VoteButton({ proposal }: { proposal: EnhancedProposal }) {
  const { address } = useAccount()
  const { data: blockNumber } = useBlockNumber()
  const tx = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash: tx.data })
  const currentChainId = useChainId()
  const { switchChain } = useSwitchChain()

  const multicall = useReadContracts({
    contracts: [
      {
        address: proposal.governor,
        abi: GovernorContract.abi,
        functionName: 'hasVoted',
        // @ts-expect-error: the query is not run until the address and blockNumber are known
        args: [BigInt(proposal.id), address],
      },
      {
        address: proposal.governor,
        abi: GovernorContract.abi,
        functionName: 'getVotes',
        // @ts-expect-error: the query is not run until the address and blockNumber are known
        args: [address, (blockNumber ?? BigInt(0)) - BigInt(1)],
      },
    ],
    query: {
      enabled: !!address && !!blockNumber && !!proposal?.id,
    },
  })

  const hasVoted = multicall.data?.[0].result
  const votingPower = multicall.data?.[1].result

  useEffect(() => {
    if (receipt.isSuccess) {
      multicall.refetch()
      revalidateProposal(proposal.id)
    }
  }, [receipt.isSuccess])

  // Early return if proposal.id is not available
  if (!proposal?.id) {
    return <Button variant="primary" disabled isLoading />
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const choice = Number(formData.get('choice') as string)
    const reason = formData.get('reason') as string

    if (reason) {
      tx.writeContract({
        address: proposal.governor,
        abi: GovernorContract.abi,
        functionName: 'castVoteWithReason',
        args: [BigInt(proposal.id), choice, reason],
      })
    } else {
      tx.writeContract({
        address: proposal.governor,
        abi: GovernorContract.abi,
        functionName: 'castVote',
        args: [BigInt(proposal.id), choice],
      })
    }
  }

  if (address && !multicall.data) {
    return <Button variant="primary" disabled isLoading />
  }

  if (!address) {
    return (
      <Button variant="primary" className="font-bold" disabled>
        Connect to Vote
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild={currentChainId === zksync.id}>
        <Button
          variant="primary"
          className="font-bold"
          disabled={hasVoted === true}
          onClick={() => {
            if (currentChainId !== zksync.id) {
              switchChain({ chainId: zksync.id })
            }
          }}
        >
          {hasVoted === true
            ? 'Already Voted'
            : currentChainId !== zksync.id
              ? 'Switch chains'
              : `Vote with ${bigintToFormattedString(votingPower ?? '0')} $ZK`}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Vote Onchain
            </DialogTitle>

            <DialogDescription className="text-base">
              Once submitted, your vote cannot be changed.
            </DialogDescription>
          </DialogHeader>

          {/* Select choice */}
          <div className="space-y-4">
            <RadioGroup defaultValue="1" name="choice" disabled={!!tx.data}>
              <VoteRadioGroupItem id="1" label="For" />
              <VoteRadioGroupItem id="0" label="Against" />
              <VoteRadioGroupItem id="2" label="Abstain" />
            </RadioGroup>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="reason">Reason</Label>
                <span className="text-sm text-muted-foreground">Optional</span>
              </div>
              <Textarea
                id="reason"
                name="reason"
                placeholder="I believe..."
                disabled={!!tx.data}
              />
            </div>
          </div>

          {votingPower === BigInt(0) && (
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>Unable to vote</AlertTitle>
              <AlertDescription>
                You currently have 0 voting power.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex-col! items-end gap-1.5">
            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>

              {receipt.isSuccess ? (
                <DialogClose asChild>
                  <Button className="bg-green-600 font-bold hover:bg-green-600/90">
                    Success!
                  </Button>
                </DialogClose>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  className="font-bold"
                  isLoading={tx.isPending || receipt.isLoading}
                  disabled={votingPower === BigInt(0)}
                >
                  Vote with {bigintToFormattedString(votingPower ?? '0')} $ZK
                </Button>
              )}
            </div>

            {tx.data && (
              <a
                href={`https://explorer.zksync.io/tx/${tx.data}`}
                target="_blank"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:underline"
              >
                View on block explorer
              </a>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function VoteRadioGroupItem({ id, label }: { id: string; label: string }) {
  return (
    <Label
      htmlFor={id}
      className="flex items-center space-x-2 bg-gray-100 border rounded-md p-2"
    >
      <span className="w-full">{label}</span>
      <RadioGroupItem value={id} id={id} className="" />
    </Label>
  )
}
