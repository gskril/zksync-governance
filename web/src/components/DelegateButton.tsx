'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { Button } from './ui/button'
import { DelegateName } from '@/components/DelegateName'
import { bigintToFormattedString, cn } from '@/lib/utils'
import { GetDelegateResponse } from 'indexer/types'
import { ArrowDown, Check } from 'lucide-react'
import { ZkToken } from 'indexer/contracts'
import { zksync } from 'wagmi/chains'
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { Card } from './ui/card'
import { Typography } from './ui/typography'
import { useState } from 'react'

type DelegateButtonProps = {
  delegate: NonNullable<GetDelegateResponse>
}

export function DelegateButton({ delegate }: DelegateButtonProps) {
  const [open, setOpen] = useState(false)
  const { address } = useAccount()
  const currentChainId = useChainId()
  const { switchChain } = useSwitchChain()

  const { data: tokenBalance } = useReadContract({
    ...ZkToken,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: zksync.id,
  })

  const tx = useWriteContract()
  const receipt = useWaitForTransactionReceipt({ hash: tx.data })

  const rightChain = currentChainId === zksync.id
  const hasTokens = tokenBalance !== undefined && tokenBalance > BigInt(0)
  const formattedTokenBalance = hasTokens
    ? `${bigintToFormattedString(tokenBalance)} ZK`
    : '—'

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="primary"
            className="rounded-full"
            disabled={!address}
          >
            Delegate
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader className="text-center sm:text-center">
            <DialogTitle>Delegate Votes</DialogTitle>
          </DialogHeader>

          <div className="my-2 space-y-3">
            <Card className="p-3 gap-1.5 text-sm flex flex-col items-center">
              <Typography className="font-bold">Your tokens</Typography>
              <Typography>{formattedTokenBalance}</Typography>
            </Card>

            <div className="flex justify-center">
              <div className="grid place-items-center rounded-full border bg-background p-1.5 text-muted-foreground">
                <ArrowDown className="size-4" />
              </div>
            </div>

            <Card className="p-3 gap-1.5 text-sm flex flex-col items-center">
              <Typography className="font-bold">Delegate votes to</Typography>
              <div
                className={cn(
                  '[&_img]:shadow-lg [&_img]:ring-2 [&_img]:ring-white'
                )}
              >
                <DelegateName address={delegate.address} size="sm" />
              </div>
            </Card>
          </div>

          <Button
            variant="primary"
            className={cn(
              'w-full rounded-full',
              receipt.isSuccess &&
                'bg-brand-green hover:bg-brand-green/90 font-semibold'
            )}
            disabled={!address}
            isLoading={tx.isPending || receipt.isLoading}
            onClick={() => {
              if (receipt.isSuccess) {
                setOpen(false)
                return
              }

              if (currentChainId !== zksync.id) {
                switchChain({ chainId: zksync.id })
                return
              }

              tx.writeContract({
                address: ZkToken.address,
                abi: ZkToken.abi,
                functionName: 'delegate',
                args: [delegate.address],
                chainId: zksync.id,
              })
            }}
          >
            {receipt.isSuccess ? (
              <>
                <Check />
                Votes Delegated
              </>
            ) : rightChain ? (
              'Delegate'
            ) : (
              'Switch to ZKsync'
            )}
          </Button>

          {receipt.isSuccess && (
            <a
              href={`https://explorer.zksync.io/tx/${tx.data}`}
              target="_blank"
              className="text-sm -mt-1.5 w-fit text-center mx-auto text-muted-foreground hover:underline"
            >
              View on Block Explorer
            </a>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
