import { Hero, Stat, Stats } from 'pivoshenko.ui'
import type { ReactNode } from 'react'

type CatalogHeroProps = {
  /** Small label above the title */
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
  counters?: Array<{ label: string; value: number }>
}

export function CatalogHero({
  eyebrow,
  title,
  lead,
  children,
  counters = [],
}: CatalogHeroProps) {
  return (
    <Hero>
      {eyebrow && (
        <p className="type-label fg-subtle">
          <span aria-hidden="true" className="text-accent">
            {'//'}
          </span>{' '}
          {eyebrow}
        </p>
      )}

      <h1
        className={`type-display text-2xl leading-tight sm:text-3xl ${eyebrow ? 'mt-3' : ''}`}
      >
        {title}
      </h1>

      {lead && <p className="type-body fg-primary mt-4 text-base">{lead}</p>}

      {children}

      {counters.length > 0 && (
        <Stats className="mt-8">
          {counters.map(({ label, value }) => (
            <Stat
              key={label}
              size="lg"
              tone="lavender"
              value={value}
              label={label}
            />
          ))}
        </Stats>
      )}
    </Hero>
  )
}
