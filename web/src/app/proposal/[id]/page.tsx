import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { CopyButton } from '@/components/CopyButton'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Typography } from '@/components/ui/typography'
import { getProposal } from '@/hooks/useProposal'
import { formatTimestamp, nameWithFallback } from '@/lib/utils'

import {
  MobileVotesCard,
  ProposalActionsClient,
  ProposalStatusClient,
  VotesPanel,
} from './client'

// Cache forever once generated, generate new pages on-demand
export const revalidate = false
export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const proposal = await getProposal(id)

  if (!proposal) {
    return notFound()
  }

  return {
    title: `${proposal.title} - ZKsync Governance`,
    description: proposal.description,
  }
}

export default async function Proposal({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const proposal = await getProposal(id)

  if (!proposal) {
    return notFound()
  }

  return (
    <div className="container">
      <Nav />

      <div className="grid items-center gap-6 pb-4 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <ProposalStatusClient proposalId={id} />

          <Typography as="h1">{proposal.title}</Typography>

          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <Typography className="flex items-center text-sm">
              <span className="hidden sm:block">Proposed by</span>
              <span className="block sm:hidden">By</span>
              <div className="mx-1.5 flex items-center gap-1">
                <a
                  href={`https://explorer.zksync.io/address/${proposal.proposer}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold hover:underline"
                >
                  {nameWithFallback(undefined, proposal.proposer)}
                </a>
              </div>
              <span className="hidden sm:block">
                on {formatTimestamp(proposal.createdAtTimestamp)}
              </span>
            </Typography>
          </div>
        </div>

        <ProposalActionsClient proposalId={id} />
      </div>

      <MobileVotesCard proposalId={id} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Proposal */}
        <Card className="h-fit overflow-x-auto rounded-xl shadow-custom-card">
          <Tabs defaultValue="body" className="p-3">
            <div className="flex items-center gap-3">
              <TabsList className="h-auto w-full justify-start border rounded-full p-1">
                <TabsTrigger className="w-full rounded-full" value="body">
                  Description
                </TabsTrigger>
                <TabsTrigger className="w-full rounded-full" value="calldata">
                  <span className="hidden lg:block">Executable Code</span>
                  <span className="block lg:hidden">Code</span>
                </TabsTrigger>
              </TabsList>

              <CopyButton text={proposal.description} />
            </div>

            <CardContent className="px-0 md:px-3 pb-4 pt-2">
              {/* Proposal body */}
              <TabsContent value="body">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <Typography as="h1" className="mb-6 lg:text-4xl">
                        {children}
                      </Typography>
                    ),
                    h2: ({ children }) => (
                      <Typography as="h2" className="mb-2">
                        {children}
                      </Typography>
                    ),
                    h3: ({ children }) => (
                      <Typography as="h3">{children}</Typography>
                    ),
                    h4: ({ children }) => (
                      <Typography as="h4">{children}</Typography>
                    ),
                    h5: ({ children }) => (
                      <Typography as="h5">{children}</Typography>
                    ),
                    h6: ({ children }) => (
                      <Typography as="h6">{children}</Typography>
                    ),
                    p: ({ children }) => (
                      <Typography as="p" className="wrap-break-words">
                        {children}
                      </Typography>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-primary underline"
                      >
                        {children}
                      </a>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
                        {children}
                      </ol>
                    ),
                    table: ({ children }) => (
                      <div className="my-6 rounded border">
                        <Table>{children}</Table>
                      </div>
                    ),
                    li: ({ children }) => (
                      <li className="wrap-break-words">{children}</li>
                    ),
                    thead: ({ children }) => (
                      <TableHeader>{children}</TableHeader>
                    ),
                    tbody: ({ children }) => <TableBody>{children}</TableBody>,
                    tfoot: ({ children }) => (
                      <TableFooter>{children}</TableFooter>
                    ),
                    tr: ({ children }) => <TableRow>{children}</TableRow>,
                    th: ({ children }) => <TableHead>{children}</TableHead>,
                    td: ({ children }) => <TableCell>{children}</TableCell>,
                    caption: ({ children }) => (
                      <TableCaption>{children}</TableCaption>
                    ),
                    hr: () => <hr className="my-6" />,
                    pre: ({ children }) => (
                      <pre className="my-6 max-w-full overflow-x-auto rounded-md bg-muted p-4">
                        {children}
                      </pre>
                    ),
                  }}
                  remarkPlugins={[remarkGfm]}
                >
                  {proposal.description}
                </ReactMarkdown>
              </TabsContent>

              {/* Executable code */}
              <TabsContent value="calldata">
                {proposal.targets.map((target, index) => (
                  <div key={index} className="my-6 text-sm">
                    <pre className="max-w-full whitespace-pre-wrap break-all rounded-md bg-muted p-4">
                      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-6">
                        <div>target:</div>
                        <div>{target}</div>

                        <div>calldata:</div>
                        <div>{proposal.calldatas[index]}</div>

                        <div>value:</div>
                        <div>{proposal.values[index]}</div>

                        {proposal.signatures[index] && (
                          <>
                            <div>signature:</div>
                            <div>{proposal.signatures[index]}</div>
                          </>
                        )}
                      </div>
                    </pre>

                    <div className="mt-2 flex justify-end gap-2">
                      <a
                        href={`https://explorer.zksync.io/address/${target}`}
                        target="_blank"
                        className={buttonVariants({
                          size: 'xs',
                        })}
                      >
                        View Contract
                      </a>

                      <a
                        href={`https://calldata.swiss-knife.xyz/decoder?calldata=${proposal.calldatas[index]}&chainId=1&address=${target}`}
                        target="_blank"
                        className={buttonVariants({
                          size: 'xs',
                        })}
                      >
                        Decode Calldata
                      </a>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Votes */}
        <VotesPanel proposalId={id} />
      </div>

      <Footer />
    </div>
  )
}
