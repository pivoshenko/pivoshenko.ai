import { CatalogHero } from '@/components/catalog-hero'
import { mcpEntry } from '@/components/entry'
import { EntryCatalog } from '@/components/entry-catalog'
import { McpMap } from '@/components/mcp-map'
import { loadCatalog } from '@/lib/data'
import type { Metadata } from 'next'
import { PageBody } from 'pivoshenko.ui'

export const metadata: Metadata = {
  title: 'MCPs',
  description: 'The systems my agents can reach, and how each one connects.',
}

export default function McpsPage() {
  const catalog = loadCatalog()

  return (
    <>
      <CatalogHero title={<span className="fg-title">MCPs</span>} />
      <PageBody className="space-y-10">
        <McpMap mcps={catalog.mcps} />
        <EntryCatalog
          id="mcps"
          title="Servers"
          entries={catalog.mcps.map(mcpEntry)}
        />
      </PageBody>
    </>
  )
}
