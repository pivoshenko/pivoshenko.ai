import { CatalogHero } from '@/components/catalog-hero'
import { archivedEntry, instructionEntry } from '@/components/entry'
import { EntryCatalog } from '@/components/entry-catalog'
import { loadCatalog } from '@/lib/data'
import type { Metadata } from 'next'
import { PageBody } from 'pivoshenko.ui'

export const metadata: Metadata = {
  title: 'Instructions',
  description: 'The global rules every agent session of mine starts with.',
}

export default function InstructionsPage() {
  const catalog = loadCatalog()
  const entries = catalog.instructions.map(instructionEntry)

  return (
    <>
      <CatalogHero
        title={<span className="fg-title">Instructions</span>}
        counters={[
          { label: 'own', value: entries.filter((e) => e.local).length },
          { label: 'external', value: entries.filter((e) => !e.local).length },
          { label: 'archived', value: catalog.archivedInstructions.length },
        ]}
      />
      <PageBody>
        <EntryCatalog
          id="instructions"
          title="Instructions"
          entries={entries}
          archived={catalog.archivedInstructions.map(archivedEntry)}
        />
      </PageBody>
    </>
  )
}
