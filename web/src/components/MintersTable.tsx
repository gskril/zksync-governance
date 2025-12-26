'use client'

import type { Minter } from 'indexer/types'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  bigintToFormattedString,
  formatTimestamp,
  truncateAddress,
} from '@/lib/utils'

export function MintersTable({ minters }: { minters: Minter[] }) {
  return (
    <div className="shadow-custom-card rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40 min-w-40">Address</TableHead>
            <TableHead className="w-28 min-w-28">Created</TableHead>
            <TableHead className="w-40 min-w-40">Minter</TableHead>
            <TableHead className="w-36 min-w-36">Tokens Minted</TableHead>
            <TableHead className="w-36 min-w-36">Cap</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {minters.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Error loading capped minters
              </TableCell>
            </TableRow>
          )}

          {minters.length > 0 &&
            minters.map((minter) => (
              <TableRow key={minter.address} className="group">
                {/* Address */}
                <TableCell>
                  <a
                    href={`https://explorer.zksync.io/address/${minter.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {truncateAddress(minter.address)}
                  </a>
                </TableCell>

                {/* Created */}
                <TableCell>{formatTimestamp(minter.createdAt)}</TableCell>

                {/* Minter */}
                <TableCell>
                  <a
                    href={`https://explorer.zksync.io/address/${minter.minter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {truncateAddress(minter.minter)}
                  </a>
                </TableCell>

                {/* Tokens Minted */}
                <TableCell>{bigintToFormattedString(minter.minted)}</TableCell>

                {/* Cap */}
                <TableCell>{bigintToFormattedString(minter.cap)}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
