'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Check, Copy } from 'lucide-react'
import { truncateAddress } from '@/lib/utils'

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
      {isCopied ? <Check /> : <Copy />}
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
          <Check className="max-w-full max-h-full" />
        ) : (
          <Copy className="max-w-full max-h-full" />
        )}
      </div>
    </Button>
  )
}
