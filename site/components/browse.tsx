import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SectionHeader } from 'pivoshenko.ui'

type Destination = {
  href: string
  title: string
  count: number
  description: string
}

type BrowseProps = {
  destinations: Destination[]
}

// Rows rather than cards: the landing already spends its cards on the plugin,
// and three one-line choices do not need a grid
export function Browse({ destinations }: BrowseProps) {
  return (
    <section id="browse" className="scroll-mt-24 space-y-2">
      <SectionHeader title="Browse" />
      <ul className="m-0 list-none border-t border-border-subtle p-0">
        {destinations.map((destination) => (
          <li key={destination.href}>
            <Link
              href={destination.href}
              className="group relative grid grid-cols-[1fr] items-baseline gap-x-6 gap-y-1 border-b border-border-subtle px-3 py-4 no-underline transition-colors duration-fast hover:bg-bg-surface sm:grid-cols-[10rem_1fr_auto]"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-1/2 h-0 w-[2px] bg-accent transition-[height,top] duration-base ease-out group-hover:top-[20%] group-hover:h-[60%] motion-reduce:transition-none"
              />
              <span className="type-heading fg-title flex items-baseline gap-2">
                {destination.title}
                <span className="type-meta fg-muted">{destination.count}</span>
              </span>
              <span className="type-body fg-body">
                {destination.description}
              </span>
              <ArrowRight
                size={14}
                strokeWidth={2}
                aria-hidden="true"
                className="hidden self-center text-fg-faint transition-[color,transform] duration-base ease-out group-hover:translate-x-1 group-hover:text-accent motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 sm:block"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
