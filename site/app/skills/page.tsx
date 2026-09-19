import { CatalogHero } from '@/components/catalog-hero'
import { archivedEntry, skillEntry } from '@/components/entry'
import { EntryCatalog } from '@/components/entry-catalog'
import { loadCatalog } from '@/lib/data'
import type { Metadata } from 'next'
import { PageBody } from 'pivoshenko.ui'

export const metadata: Metadata = {
  title: 'Skills',
  description: 'Every agent skill in the catalog, mine and the ones I pull in.',
}

export default function SkillsPage() {
  const catalog = loadCatalog()
  const entries = catalog.skills.map(skillEntry)

  return (
    <>
      <CatalogHero title={<span className="fg-title">Skills</span>} />
      <PageBody>
        <EntryCatalog
          id="skills"
          title="Skills"
          entries={entries}
          archived={catalog.archivedSkills.map(archivedEntry)}
        />
      </PageBody>
    </>
  )
}
