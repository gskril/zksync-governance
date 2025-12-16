'use client'

import { InfoIcon, MinusIcon, PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { ZkProtocolGovernor, ZkToken, ZkTokenGovernor } from 'shared/contracts'
import { Address, Hex, decodeEventLog, isAddress, isHex } from 'viem'
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { zksync } from 'wagmi/chains'

import { Nav } from '@/components/Nav'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { InputWithLabel, InputWrapper } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { GOVERNORS, bigintToFormattedString, cn } from '@/lib/utils'

type Transaction = {
  target: string
  value: number
  calldata: string
}

export function CreateProposalClient() {
  const { isConnected, address } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const tx = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash: tx.data })

  const { data: threshold } = useReadContract({
    ...ZkTokenGovernor,
    functionName: 'proposalThreshold',
    chainId: zksync.id,
  })

  const { data: votingPower, error: votingPowerError } = useReadContract({
    ...ZkToken,
    functionName: 'getVotes',
    args: address ? [address] : undefined,
    chainId: zksync.id,
  })

  const hasEnoughVotingPower =
    (votingPower ?? BigInt(0)) >= (threshold ?? BigInt(0))

  const [transactions, setTransactions] = useState<Transaction[]>([
    { target: '', value: 0, calldata: '' },
  ])

  async function handleCreateProposal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const governorContract = formData.get('governorContract') as string
    const proposalMarkdown = formData.get('proposalMarkdown') as string

    await switchChainAsync({ chainId: zksync.id })
    tx.writeContract({
      address: governorContract as Address,
      abi: ZkProtocolGovernor.abi, // All 3 governors use the same ABI
      functionName: 'propose',
      args: [
        transactions.map((transaction) => transaction.target as Address), // targets
        transactions.map((transaction) => BigInt(transaction.value)), // values
        transactions.map((transaction) => transaction.calldata as Hex), // calldatas
        proposalMarkdown, // description
      ],
    })
  }

  return (
    <div className="container">
      <Nav />

      <main className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-4">
          {receipt.isSuccess ? 'Proposal Created' : 'Create a Proposal'}
        </h1>

        {(() => {
          if (receipt.isSuccess) {
            const proposalLogs = receipt.data!.logs
            const proposalCreatedTopic =
              '0x7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0'
            const proposalCreatedLog = proposalLogs.find(
              (log) => log.topics[0] === proposalCreatedTopic
            )
            const decodedLog = proposalCreatedLog
              ? decodeEventLog({
                  abi: [ZkProtocolGovernor.abi[10]],
                  data: proposalCreatedLog.data,
                  topics: proposalCreatedLog.topics,
                })
              : undefined

            const proposalId = decodedLog?.args.proposalId

            return (
              <>
                <p className="text-center">
                  Proposal is now live onchain. View the proposal or visit
                  blockchain explorer.
                </p>

                <div className="grid grid-cols-2 w-full items-center gap-2 justify-center mt-4">
                  <a
                    href={`https://explorer.zksync.io/tx/${tx.data}`}
                    target="_blank"
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'rounded-full'
                    )}
                  >
                    View on Block Explorer
                  </a>

                  <Link
                    href={proposalId ? `/proposal/${proposalId}` : '/'}
                    className={cn(
                      buttonVariants({ variant: 'primary' }),
                      'rounded-full'
                    )}
                  >
                    {proposalId ? 'View Proposal' : 'Go Home'}
                  </Link>
                </div>
              </>
            )
          }

          return (
            <>
              {(!isConnected || !hasEnoughVotingPower) && (
                <Alert variant="info" className="mb-4">
                  <InfoIcon />
                  <AlertTitle>View-only mode.</AlertTitle>
                  <AlertDescription>
                    Connect a wallet with &gt;21M votes to create a proposal.{' '}
                    {votingPower !== undefined &&
                      `You currently have ${bigintToFormattedString(votingPower)} votes.`}
                  </AlertDescription>
                </Alert>
              )}

              <form className="space-y-4" onSubmit={handleCreateProposal}>
                <InputWrapper label="Governor Contract">
                  <Select
                    name="governorContract"
                    defaultValue={ZkTokenGovernor.address}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Array.from(GOVERNORS.entries()).map(
                          ([address, name]) => (
                            <SelectItem key={address} value={address}>
                              {name}
                            </SelectItem>
                          )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </InputWrapper>

                <InputWrapper label="Proposal Markdown">
                  <Textarea placeholder="" required name="proposalMarkdown" />
                </InputWrapper>

                <div className="flex items-center gap-4 justify-between pt-4">
                  <span>Transactions</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setTransactions([
                        ...transactions,
                        { target: '', value: 0, calldata: '' },
                      ])
                    }
                  >
                    <PlusIcon />
                  </Button>
                </div>

                {transactions.map((transaction, index) => (
                  <TransactionGroup
                    key={index}
                    transaction={transaction}
                    onDelete={() =>
                      setTransactions((current) =>
                        current.filter((_, i) => i !== index)
                      )
                    }
                    onChange={(update) =>
                      setTransactions((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, ...update } : item
                        )
                      )
                    }
                  />
                ))}

                <Button
                  type="submit"
                  variant={receipt.isError ? 'destructive' : 'primary'}
                  className="w-full rounded-full"
                  // Disable button if any transaction is missing data
                  disabled={
                    transactions.length === 0 ||
                    !hasEnoughVotingPower ||
                    transactions.some(
                      (transaction) =>
                        !isAddress(transaction.target) ||
                        !isHex(transaction.calldata)
                    )
                  }
                  isLoading={tx.isPending || receipt.isLoading}
                >
                  {tx.isPending
                    ? 'Pending Approval...'
                    : receipt.isError
                      ? 'Transaction Failed'
                      : receipt.isLoading
                        ? 'Pending Transaction...'
                        : 'Create Proposal'}
                </Button>
              </form>
            </>
          )
        })()}
      </main>
    </div>
  )
}

type TransactionGroupProps = {
  transaction: Transaction
  onDelete: () => void
  onChange: (update: Partial<Transaction>) => void
}

function TransactionGroup({
  transaction,
  onDelete,
  onChange,
}: TransactionGroupProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex flex-col gap-3 relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 absolute top-1 right-1"
        onClick={onDelete}
        aria-label="Delete transaction"
      >
        <MinusIcon />
      </Button>

      <InputWithLabel
        label="Target Address"
        placeholder="0x1234..."
        value={transaction.target}
        onChange={(event) => onChange({ target: event.target.value })}
        data-1p-ignore
        required
      />
      <InputWithLabel
        label="Value of ETH (in wei)"
        placeholder="0"
        type="number"
        min={0}
        value={transaction.value}
        onChange={(event) =>
          onChange({ value: Number(event.target.value) || 0 })
        }
        required
      />
      <InputWrapper label="Calldata">
        <Textarea
          placeholder="0x1234..."
          value={transaction.calldata}
          onChange={(event) => onChange({ calldata: event.target.value })}
          required
        />
      </InputWrapper>
    </div>
  )
}
