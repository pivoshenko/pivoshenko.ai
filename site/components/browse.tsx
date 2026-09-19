'use client'

import Link from 'next/link'
import { List, Row, SectionHeader } from 'pivoshenko.ui'

type Destination = {
  href: string
  title: string
  count: number
  description: string
}

type BrowseProps = {
  destinations: Destination[]
}

export function Browse({ destinations }: BrowseProps) {
  return (
    <section id="browse" className="scroll-mt-24 space-y-2">
      <SectionHeader title="Browse" />
      {/* next/link rather than the plain anchor Row defaults to, so a catalog
          page is a client navigation instead of a full load. The 'use client'
          above is what lets Link cross into Row: a component reference cannot
          be handed from a server component to a client one as a prop */}
      <List as={Link} lead="3rem">
        {destinations.map((destination) => (
          <Row
            key={destination.href}
            href={destination.href}
            lead={destination.count}
            title={destination.title}
            desc={destination.description}
          />
        ))}
      </List>
    </section>
  )
}
