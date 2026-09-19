import { loadCatalog } from '@/lib/data'
import { Hero, Stat, Stats } from 'pivoshenko.ui'

const counters = ['skills', 'mcps', 'instructions', 'plugins'] as const

export function CatalogHero() {
  const catalog = loadCatalog()

  return (
    <Hero>
      <h1 className="type-display text-2xl leading-tight sm:text-3xl">
        <span className="fg-title">pivoshenko</span>
        <span className="fg-muted">.</span>
        <span className="text-accent">ai</span>
      </h1>

      <p className="type-body fg-primary mt-4 text-base">
        My personal AI workspace with curated skills, MCPs, instructions and
        plugins, managed by{' '}
        <a href="https://kasetto.dev" target="_blank" rel="noopener noreferrer">
          Kasetto
        </a>
        .
      </p>

      <div className="type-body fg-body mt-4 space-y-3">
        <p>
          The skills I actually reach for every day to do real engineering - not
          vibe coding.
        </p>
        <p>
          Building real software is hard, and the frameworks that promise to
          help mostly do it by owning your process. They take your control with
          them, and when the bug turns out to be in the process itself, it is
          almost impossible to dig out.
        </p>
        <p>
          These are deliberately small, composable and easy to adapt. They work
          with any model, and they encode how the work actually goes rather than
          how a workflow diagram says it should. Pull them apart, rewrite the
          parts that do not fit, make them yours.
        </p>
      </div>

      <Stats className="mt-8">
        {counters.map((key) => (
          <Stat
            key={key}
            size="lg"
            tone="lavender"
            value={catalog[key].length}
            label={key}
          />
        ))}
      </Stats>
    </Hero>
  )
}
