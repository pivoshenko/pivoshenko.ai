import { archivedEntry, skillEntry } from '@/components/entry'
import { SkillMap } from '@/components/skill-map'
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
      <PageBody className="space-y-10">
        <SkillMap skills={catalog.skills} />
        <Catalog
          id="skills"
          title="Skills"
          layout="cards"
          entries={catalog.skills.map(skillEntry)}
          archived={catalog.archivedSkills.map(archivedEntry)}
        />
      </PageBody>
    </>
  )
}
