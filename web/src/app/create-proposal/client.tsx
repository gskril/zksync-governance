'use client'

import { Nav } from '@/components/Nav'
import { Button } from '@/components/ui/button'
import { InputGroup, InputWrapper } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { bigintToFormattedString, GOVERNORS } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ZkProtocolGovernor, ZkToken, ZkTokenGovernor } from 'indexer/contracts'
import { InfoIcon, MinusIcon, PlusIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Address, Hex, isAddress, isHex } from 'viem'
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { zksync } from 'wagmi/chains'

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

  const { data: votingPower } = useReadContract({
    ...ZkToken,
    functionName: 'getVotes',
    args: address ? [address] : undefined,
    chainId: zksync.id,
  })

  // All governors require 21M votes to create a proposal.
  const threshold = BigInt(21_000_000) * BigInt(10 ** 18)
  const hasEnoughVotingPower = (votingPower ?? BigInt(0)) >= threshold

  const [transactions, setTransactions] = useState<Transaction[]>([
    { target: '', value: 0, calldata: '' },
  ])

  async function handleCreateProposal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const governorContract = formData.get('governorContract') as string
    const proposalMarkdown = formData.get('proposalMarkdown') as string
    console.log({ governorContract, proposalMarkdown, transactions })

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
          Create a Proposal
        </h1>

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
                  {Array.from(GOVERNORS.entries()).map(([address, name]) => (
                    <SelectItem key={address} value={address}>
                      {name}
                    </SelectItem>
                  ))}
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
                  !isAddress(transaction.target) || !isHex(transaction.calldata)
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

      <InputGroup
        label="Target Address"
        placeholder="0x1234..."
        value={transaction.target}
        onChange={(event) => onChange({ target: event.target.value })}
        data-1p-ignore
        required
      />
      <InputGroup
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
