'use client'

import { SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

import { DelegateName } from '@/components/DelegateName'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DELEGATES_PER_PAGE, useDelegates } from '@/hooks/useDelegates'
import { bigintToFormattedString, cn } from '@/lib/utils'

function DelegateRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-5 w-8" />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20" />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex items-center justify-end gap-1">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </TableCell>
    </TableRow>
  )
}

export function DelegatesTableSkeleton() {
  return (
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
          {Array.from({ length: 10 }).map((_, i) => (
            <DelegateRowSkeleton key={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function DelegatesClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const _page = searchParams.get('page')
  const q = searchParams.get('q') ?? undefined
  const currentPage = Math.max(1, parseInt(_page ?? '1', 10) || 1)

  const { data: delegates, isLoading } = useDelegates({ page: currentPage, q })

  const [searchQuery, setSearchQuery] = useState(q ?? '')
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500)

  const totalPages = q ? 1 : 100
  const rankOffset = (currentPage - 1) * DELEGATES_PER_PAGE

  useEffect(() => {
    if (debouncedSearchQuery === '') {
      router.push('/delegates', { scroll: false })
      return
    }

    router.push(`/delegates?q=${debouncedSearchQuery}`)
  }, [debouncedSearchQuery, router])

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <>
      <div className="lg:absolute lg:right-0 lg:transform lg:-translate-y-12 lg:-translate-x-6 mb-4">
        <InputGroup className="w-72 max-w-full">
          <InputGroupInput
            placeholder="Search address or ENS name"
            value={searchQuery}
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
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <DelegateRowSkeleton key={i} />
              ))
            ) : delegates?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No Delegates found
                </TableCell>
              </TableRow>
            ) : (
              delegates?.map((delegate, index) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && !q && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={
                  currentPage > 1 ? `/delegates?page=${currentPage - 1}` : '#'
                }
                aria-disabled={currentPage <= 1}
                className={
                  currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>

            {getPageNumbers().map((page, i) =>
              page === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    href={`/delegates?page=${page}`}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href={
                  currentPage < totalPages
                    ? `/delegates?page=${currentPage + 1}`
                    : '#'
                }
                aria-disabled={currentPage >= totalPages}
                className={
                  currentPage >= totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  )
}
