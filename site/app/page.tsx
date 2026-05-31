import { Catalog } from '@/components/catalog'
import { loadCatalog } from '@/lib/data'

export default function HomePage() {
  const catalog = loadCatalog()
  const localSkills = catalog.skills.filter((s) => s.local)
  const localMcps = catalog.mcps.filter((m) => m.local)
  const externalSkills = catalog.skills.filter((s) => !s.local)
  const externalMcps = catalog.mcps.filter((m) => !m.local)

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <p className="type-body fg-body">
          Curated AI skills and MCPs, synced via{' '}
          <a
            href="https://kasetto.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            Kasetto
          </a>
          . Config and source live on{' '}
          <a
            href="https://github.com/pivoshenko/pivoshenko.ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </section>

      <Catalog
        localSkills={localSkills}
        localMcps={localMcps}
        externalSkills={externalSkills}
        externalMcps={externalMcps}
        sources={catalog.sources}
      />
    </div>
  )
}
