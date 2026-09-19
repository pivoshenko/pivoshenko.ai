import { Catalog } from '@/components/catalog'
import { loadCatalog } from '@/lib/data'

export default function HomePage() {
  const catalog = loadCatalog()

  return (
    <Catalog
      skills={catalog.skills}
      mcps={catalog.mcps}
      instructions={catalog.instructions}
      plugins={catalog.plugins}
      archivedSkills={catalog.archivedSkills}
      archivedInstructions={catalog.archivedInstructions}
    />
  )
}
