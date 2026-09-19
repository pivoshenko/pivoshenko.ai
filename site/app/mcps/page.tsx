import { mcpEntry } from '@/components/entry'
import { McpMap } from '@/components/mcp-map'
import { loadCatalog } from '@/lib/data'
import type { Metadata } from 'next'
import { Catalog, HeroBand, PageBody } from 'pivoshenko.ui'

export const metadata: Metadata = {
  title: 'MCPs',
  description: 'The systems my agents can reach, and how each one connects.',
}

export default function McpsPage() {
  const catalog = loadCatalog()

  return (
    <>
      <HeroBand title={<span className="fg-title">MCPs</span>} />
      <PageBody className="space-y-10">
        <McpMap mcps={catalog.mcps} />
        <Catalog
          id="mcps"
          title="Servers"
          entries={catalog.mcps.map(mcpEntry)}
        />
      </PageBody>
    </>
  )
}
