import { InstructionHighlights } from '@/components/instruction-highlights'
import { loadCatalog } from '@/lib/data'
import type { Metadata } from 'next'
import { HeroBand, PageBody } from 'pivoshenko.ui'

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
        <div className="space-y-10">
          <InstructionHighlights
            id="instructions"
            title="Instructions"
            instructions={catalog.instructions}
          />
          {catalog.archivedInstructions.length > 0 && (
            <InstructionHighlights
              id="archived"
              title="Archived"
              instructions={catalog.archivedInstructions}
              archived
            />
          )}
        </div>
      </PageBody>
    </>
  )
}
