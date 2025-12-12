'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebounce } from 'use-debounce'

import { bigintToFormattedString, cn } from '@/lib/utils'
import { DelegateName } from '@/components/DelegateName'
import Link from 'next/link'
import { GetDelegatesResponse } from 'indexer/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchIcon } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { useEffect, useState } from 'react'

export function DelegatesClient({
  delegates,
  rankOffset,
}: {
  delegates: GetDelegatesResponse
  rankOffset: number
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500)

  useEffect(() => {
    if (debouncedSearchQuery === '') {
      router.push('/delegates', { scroll: false })
      return
    }

    router.push(`/delegates?q=${debouncedSearchQuery}`)
  }, [debouncedSearchQuery, router])

  return (
    <>
      <div className="lg:absolute lg:right-0 lg:transform lg:-translate-y-12 lg:-translate-x-6 mb-4">
        <InputGroup className="w-72 max-w-full">
          <InputGroupInput
            placeholder="Search address or ENS name"
            onChange={(e) => {
              setSearchQuery(e.target.value ?? '')
            }}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="shadow-custom-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14 hidden md:table-cell">Rank</TableHead>
              <TableHead>Delegate</TableHead>
              <TableHead className="w-36">Voting Power</TableHead>
              <TableHead className="hidden w-52 text-right lg:table-cell">
                Vote History
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {delegates.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No Delegates found
                </TableCell>
              </TableRow>
            )}

            {delegates.length > 0 &&
              delegates.map((delegate, index) => (
                <TableRow key={delegate.address} className="group">
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {rankOffset + index + 1}
                  </TableCell>
                  <TableCell className="md:max-w-0">
                    <Link href={`/delegates/${delegate.address}`}>
                      <DelegateName address={delegate.address} />
                    </Link>
                  </TableCell>

                  <TableCell>
                    {bigintToFormattedString(BigInt(delegate.votes ?? 0))}
                  </TableCell>

                  <TableCell className="hidden text-right lg:table-cell">
                    <div className="flex items-center justify-end gap-1">
                      {delegate.voteCasts.map((vote) => (
                        <div
                          key={vote.proposalId}
                          className={cn(
                            'size-6 rounded-full',
                            vote.support === -1 && 'bg-zinc-200',
                            vote.support === 0 && 'bg-brand-red',
                            vote.support === 1 && 'bg-brand-green',
                            vote.support === 2 && 'bg-zinc-500'
                          )}
                        />
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
