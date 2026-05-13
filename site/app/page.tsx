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
      <header className="space-y-3">
        <div className="flex items-baseline gap-3">
          <span className="type-label fg-muted">$</span>
          <h1 className="type-logo fg-primary">pivoshenko.ai</h1>
          <span className="type-meta fg-muted">/ agents workspace</span>
        </div>
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
          .
        </p>
      </header>

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
