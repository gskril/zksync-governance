'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Check, Copy } from 'lucide-react'

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
