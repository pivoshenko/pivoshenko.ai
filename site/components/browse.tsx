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
      <List lead="3rem">
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
