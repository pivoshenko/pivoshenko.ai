import { SectionHeader } from 'pivoshenko.ui'

type Principle = {
  index: string
  title: string
  body: string
}

const principles: Principle[] = [
  {
    index: '01',
    title: 'Small and composable',
    body: 'A skill does one thing and says where its boundary is. Cut one up, keep the half you need, wire it to the next. Nothing here owns your process or hides it behind a runtime.',
  },
  {
    index: '02',
    title: 'Any model, any host',
    body: 'Plain Markdown and JSON, no framework and no lock-in. The same skill runs wherever your agent runs, and a model you have not tried yet will read it the same way.',
  },
  {
    index: '03',
    title: 'Real practice, not a diagram',
    body: 'Every one of these came out of work that had to ship. They encode how the job actually goes - the checks, the boundaries, the order - rather than a process somebody drew.',
  },
]

export function Principles() {
  return (
    <section id="principles" className="scroll-mt-24 space-y-2">
      <SectionHeader title="Principles" />
      <div className="grid gap-x-10 gap-y-8 pt-2 md:grid-cols-3">
        {principles.map((principle) => (
          <div key={principle.index}>
            <span aria-hidden="true" className="type-label text-accent">
              {principle.index}
            </span>
            <h3 className="type-heading fg-title mt-3">{principle.title}</h3>
            <p className="type-body fg-body mt-2">{principle.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
