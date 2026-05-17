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
        <p className="type-body fg-body max-w-2xl">
          Curated AI skills and MCP servers, synced via{' '}
          <a
            href="https://kasetto.dev"
            className="underline decoration-[#b89cdc]/40 hover:decoration-[#b89cdc] underline-offset-2 transition-colors"
            style={{ color: '#b89cdc' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Kasetto
          </a>
          . Config and source live on{' '}
          <a
            href="https://github.com/pivoshenko/pivoshenko.ai"
            className="underline decoration-current/40 hover:decoration-current underline-offset-2 transition-colors"
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
