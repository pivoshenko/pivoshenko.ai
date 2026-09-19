import { archivedEntry, skillEntry } from '@/components/entry'
import { loadCatalog } from '@/lib/data'
import type { Metadata } from 'next'
import { Catalog, HeroBand, PageBody } from 'pivoshenko.ui'

export const metadata: Metadata = {
  title: 'Skills',
  description: 'Every agent skill in the catalog, mine and the ones I pull in.',
}

export default function SkillsPage() {
  const catalog = loadCatalog()

  return (
    <>
      <HeroBand title={<span className="fg-title">Skills</span>} />
      <PageBody>
        <Catalog
          id="skills"
          title="Skills"
          entries={catalog.skills.map(skillEntry)}
          archived={catalog.archivedSkills.map(archivedEntry)}
        />
      </PageBody>
    </>
  )
}
