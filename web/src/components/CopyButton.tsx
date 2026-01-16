'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { truncateAddress } from '@/lib/utils'

import { Button } from './ui/button'

type Props = {
  text: string
}

export function CopyButton({ text }: Props) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <Button
      className="rounded-full bg-zinc-50 border min-w-33"
      variant="secondary"
      onClick={handleCopy}
    >
      {isCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {isCopied ? 'Copied' : 'Copy Page'}
    </Button>
  )
}

export function CopyAddressButton({ address }: { address: string }) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <Button
      className="rounded-full bg-zinc-50 border text-zinc-500"
      variant="secondary"
      size="xs"
      onClick={handleCopy}
    >
      <span>{truncateAddress(address)}</span>
      <div className="size-3.5">
        {isCopied ? (
          <Check className="max-w-full max-h-full" aria-hidden="true" />
        ) : (
          <Copy className="max-w-full max-h-full" aria-hidden="true" />
        )}
      </div>
    </Button>
  )
}
