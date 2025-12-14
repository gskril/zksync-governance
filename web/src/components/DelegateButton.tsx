'use client'

import { useAccount } from 'wagmi'
import { Button } from './ui/button'
import { GetDelegateResponse } from 'indexer/types'

type DelegateButtonProps = {
  delegate: GetDelegateResponse
}

export function DelegateButton({ delegate }: DelegateButtonProps) {
  const { address } = useAccount()

  return (
    <>
      <Button variant="primary" className="rounded-full" disabled>
        Delegate
      </Button>
    </>
  )
}
