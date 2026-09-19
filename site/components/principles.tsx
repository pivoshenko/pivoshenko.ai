import { Highlights, SectionHeader } from 'pivoshenko.ui'

const principles = [
  {
    title: 'Small and composable',
    body: 'A skill does one thing and says where its boundary is. Cut one up, keep the half you need, wire it to the next. Nothing here owns your process or hides it behind a runtime.',
  },
  {
    title: 'Any model, any host',
    body: 'Plain Markdown and JSON, no framework and no lock-in. The same skill runs wherever your agent runs, and a model you have not tried yet will read it the same way.',
  },
  {
    title: 'Real practice, not a diagram',
    body: 'Every one of these came out of work that had to ship. They encode how the job actually goes - the checks, the boundaries, the order - rather than a process somebody drew.',
  },
]

export function Principles() {
  return (
    <section id="principles" className="scroll-mt-24 space-y-2">
      <SectionHeader title="Principles" />
      <Highlights items={principles} className="pt-2" />
    </section>
  )
}
