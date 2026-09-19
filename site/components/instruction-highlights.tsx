import type { Instruction } from '@/lib/data'
import { ArrowLink, Highlights, SectionHeader } from 'pivoshenko.ui'

type InstructionHighlightsProps = {
  id: string
  title: string
  instructions: Instruction[]
  /** archived files sit under archive/, and only ours are ever archived */
  archived?: boolean
}

export function InstructionHighlights({
  id,
  title,
  instructions,
  archived = false,
}: InstructionHighlightsProps) {
  const items = instructions.map((instruction) => {
    const leaf = `${archived ? 'archive/' : ''}instructions/${instruction.slug}.md`

    return {
      title: instruction.name,
      body: (
        <>
          {instruction.description}
          {instruction.local && (
            <ArrowLink
              href={`${instruction.source}/tree/main/${leaf}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex"
            >
              {leaf}
            </ArrowLink>
          )}
        </>
      ),
    }
  })

  return (
    <section id={id} className="scroll-mt-24 space-y-2">
      <SectionHeader title={title} count={instructions.length} />
      <Highlights items={items} className="pt-2" />
    </section>
  )
}
