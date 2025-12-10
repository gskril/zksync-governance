import { Footer } from '@/components/Footer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { bigintToFormattedString, cn } from '@/lib/utils'
import { Nav } from '@/components/Nav'
import { getDelegates, DELEGATES_PER_PAGE } from '@/hooks/useDelegates'
import { DelegateName } from '@/components/DelegateName'
import { Metadata } from 'next'
import Link from 'next/link'

// Serve from cache but revalidate every 60 seconds (ISR)
export const revalidate = 60

export const metadata: Metadata = {
  title: 'ZKsync Delegates',
  description: 'View the delegates of the ZKsync Governance System.',
}

type Props = {
  searchParams: Promise<{ page?: string }>
}

export default async function Delegates({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const delegates = await getDelegates(currentPage)
  const totalPages = 100

  // Calculate the rank offset based on current page
  const rankOffset = (currentPage - 1) * DELEGATES_PER_PAGE

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="container">
      <Nav />

      <div className="mb-8">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:gap-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <img
              src="/img/logo-filled-dark.svg"
              alt="ZKsync Logo"
              width={160}
              height={160}
              className="w-28 -rotate-3 rounded-3xl border-6 border-white shadow-[0_0_22px_0_#00000029] md:w-40"
            />

            <div className="space-y-2">
              <h1 className="space-y-2">
                <span className="line block text-2xl font-bold leading-none text-brand-primary">
                  ZKsync
                </span>{' '}
                <span className="block text-3xl font-bold leading-none lg:text-5xl">
                  Delegates
                </span>
              </h1>
              <span className="text-sm text-zinc-500">Quorum: 630M</span>
            </div>
          </div>
        </div>
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
            {delegates.map((delegate, index) => (
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

      <Footer />
    </div>
  )
}
