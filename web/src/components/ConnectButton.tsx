'use client'

import { useAccount, useDisconnect, useEnsName } from 'wagmi'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, nameWithFallback } from '@/lib/utils'
import { Wallet } from 'lucide-react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useMounted } from '@/hooks/useMounted'
import { env } from '@/lib/env'

export function ConnectButton() {
  const { disconnect } = useDisconnect()
  const { openConnectModal } = useConnectModal()
  const isMounted = useMounted()

  const { address } = useAccount()
  const { data: ensName } = useEnsName({ address, chainId: 1 })

  if (address && isMounted) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({}),
            'border h-fit gap-1.5 rounded-full bg-white pb-1 px-1 sm:pr-4 pt-1 text-foreground hover:bg-white/90'
          )}
        >
          <img
            src={
              ensName
                ? `https://ens-api.gregskril.com/avatar/${ensName}?width=64&fallback=${env.BASE_URL}/img/fallback-avatar.svg`
                : '/img/fallback-avatar.svg'
            }
            alt={nameWithFallback(ensName, address)}
            className="size-8 rounded-full object-cover"
          />
          <span className="hidden sm:block">
            {nameWithFallback(ensName, address)}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => disconnect()}>
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      className="rounded-full px-4"
      variant="primary"
      onClick={() => openConnectModal?.()}
    >
      <Wallet className="hidden sm:block" />
      Connect
    </Button>
  )
}
