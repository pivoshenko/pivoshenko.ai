import { Browse } from '@/components/browse'
import { PluginShowcase } from '@/components/plugin-showcase'
import { Principles } from '@/components/principles'
import { loadCatalog } from '@/lib/data'
import { HeroBand, PageBody, SectionHeader } from 'pivoshenko.ui'

export default function HomePage() {
  const catalog = loadCatalog()

  return (
    <>
      <HeroBand
        title={
          <>
            <span className="fg-title">pivoshenko</span>
            <span className="fg-muted">.</span>
            <span className="text-accent">ai</span>
          </>
        }
        lead={
          <>
            My personal AI workspace with curated skills, MCPs, instructions and
            plugins, managed by{' '}
            <a
              href="https://kasetto.dev"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kasetto
            </a>
            .
          </>
        }
        counters={[
          { label: 'skills', value: catalog.skills.length },
          { label: 'mcps', value: catalog.mcps.length },
          { label: 'instructions', value: catalog.instructions.length },
          { label: 'plugins', value: catalog.plugins.length },
        ]}
      >
        <div className="type-body fg-body mt-4 space-y-3">
          <p>
            The skills I actually reach for every day to do real engineering -
            not vibe coding.
          </p>
          <p>
            Building real software is hard, and the frameworks that promise to
            help mostly do it by owning your process. They take your control
            with them, and when the bug turns out to be in the process itself,
            it is almost impossible to dig out.
          </p>
          <p>
            These are deliberately small, composable and easy to adapt. They
            work with any model, and they encode how the work actually goes
            rather than how a workflow diagram says it should. Pull them apart,
            rewrite the parts that do not fit, make them yours.
          </p>
        </div>
      </HeroBand>

      <PageBody className="space-y-12">
        <Principles />

        <Browse
          destinations={[
            {
              href: '/skills',
              title: 'Skills',
              count: catalog.skills.length,
              description:
                'Instructions an agent loads when the work matches, mine and the ones I pull in from elsewhere',
            },
            {
              href: '/mcps',
              title: 'MCPs',
              count: catalog.mcps.length,
              description:
                'The systems my agents can reach, drawn as a map, with each server config',
            },
            {
              href: '/instructions',
              title: 'Instructions',
              count: catalog.instructions.length,
              description:
                'Standing rules synced into the agent config itself, in force before any work begins',
            },
          ]}
        />

        <section id="plugins" className="scroll-mt-24 space-y-2">
          <SectionHeader title="Plugins" count={catalog.plugins.length} />
          <div className="space-y-16 pt-4">
            {catalog.plugins.map((plugin) => (
              <PluginShowcase key={plugin.id} plugin={plugin} />
            ))}
          </div>
        </section>
      </PageBody>
    </>
  )
}
