import { archivedEntry, instructionEntry } from '@/components/entry'
import { loadCatalog } from '@/lib/data'
import type { Metadata } from 'next'
import { Catalog, HeroBand, PageBody } from 'pivoshenko.ui'

export const metadata: Metadata = {
  title: 'Instructions',
  description: 'The global rules every agent session of mine starts with.',
}

export default function InstructionsPage() {
  const catalog = loadCatalog()

  return (
    <>
      <HeroBand title={<span className="fg-title">Instructions</span>} />
      <PageBody>
        <Catalog
          id="instructions"
          title="Instructions"
          entries={catalog.instructions.map(instructionEntry)}
          archived={catalog.archivedInstructions.map(archivedEntry)}
        />
      </PageBody>
    </>
  )
}
