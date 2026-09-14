'use client'

import type { Instruction, Mcp, Skill } from '@/lib/data'
import { SectionHeader, TagButton } from 'pivoshenko.ui'
import { useEffect, useMemo, useState } from 'react'

const SECTION_IDS = [
  'own-skills',
  'own-mcps',
  'own-instructions',
  'external-skills',
  'external-mcps',
  'external-instructions',
  'archived',
]

const DOT_COLORS = [
  'bg-accent-primary',
  'bg-accent-secondary',
  'bg-accent-success',
  'bg-accent-danger',
  'bg-accent-info',
]

function dotColor(tags: string[]): string {
  if (tags.length === 0) return DOT_COLORS[0]
  let hash = 0
  for (const c of tags[0]) hash = (hash * 31 + c.charCodeAt(0)) | 0
  return DOT_COLORS[Math.abs(hash) % DOT_COLORS.length]
}

type Props = {
  localSkills: Skill[]
  localMcps: Mcp[]
  localInstructions: Instruction[]
  externalSkills: Skill[]
  externalMcps: Mcp[]
  externalInstructions: Instruction[]
  archivedSkills: Skill[]
  archivedInstructions: Instruction[]
  sources: string[]
}

export function Catalog({
  localSkills,
  localMcps,
  localInstructions,
  externalSkills,
  externalMcps,
  externalInstructions,
  archivedSkills,
  archivedInstructions,
}: Props) {
  const allTags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of [
      ...localSkills,
      ...localMcps,
      ...localInstructions,
      ...externalSkills,
      ...externalMcps,
      ...externalInstructions,
      ...archivedSkills,
      ...archivedInstructions,
    ]) {
      for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }))
  }, [
    localSkills,
    localMcps,
    localInstructions,
    externalSkills,
    externalMcps,
    externalInstructions,
    archivedSkills,
    archivedInstructions,
  ])

  const [active, setActive] = useState<Set<string>>(new Set())

  const matches = (tags: string[]) =>
    active.size === 0 || tags.some((t) => active.has(t))

  const fLocalSkills = localSkills.filter((s) => matches(s.tags))
  const fLocalMcps = localMcps.filter((m) => matches(m.tags))
  const fLocalInstructions = localInstructions.filter((i) => matches(i.tags))
  const fExternalSkills = externalSkills.filter((s) => matches(s.tags))
  const fExternalMcps = externalMcps.filter((m) => matches(m.tags))
  const fExternalInstructions = externalInstructions.filter((i) =>
    matches(i.tags),
  )
  const fArchivedSkills = archivedSkills.filter((s) => matches(s.tags))
  const fArchivedInstructions = archivedInstructions.filter((i) =>
    matches(i.tags),
  )
  const archivedCount = fArchivedSkills.length + fArchivedInstructions.length

  function toggle(tag: string) {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const tocItems = [
    { id: 'own-skills', label: 'own skills', count: fLocalSkills.length },
    { id: 'own-mcps', label: 'own mcps', count: fLocalMcps.length },
    {
      id: 'own-instructions',
      label: 'own instructions',
      count: fLocalInstructions.length,
    },
    {
      id: 'external-skills',
      label: 'external skills',
      count: fExternalSkills.length,
    },
    {
      id: 'external-mcps',
      label: 'external mcps',
      count: fExternalMcps.length,
    },
    {
      id: 'external-instructions',
      label: 'external instructions',
      count: fExternalInstructions.length,
    },
    { id: 'archived', label: 'archived', count: archivedCount },
  ]

  return (
    <div className="space-y-8">
      <TableOfContents items={tocItems} />

      <TagFilter tags={allTags} active={active} onToggle={toggle} />

      <Section id="own-skills" title="own skills" count={fLocalSkills.length}>
        {fLocalSkills.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fLocalSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} onTagClick={toggle} />
            ))}
          </div>
        )}
      </Section>

      <Section id="own-mcps" title="own mcps" count={fLocalMcps.length}>
        {fLocalMcps.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fLocalMcps.map((mcp) => (
              <McpCard key={mcp.id} mcp={mcp} onTagClick={toggle} />
            ))}
          </div>
        )}
      </Section>

      <Section
        id="own-instructions"
        title="own instructions"
        count={fLocalInstructions.length}
      >
        {fLocalInstructions.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fLocalInstructions.map((instruction) => (
              <InstructionCard
                key={instruction.id}
                instruction={instruction}
                onTagClick={toggle}
              />
            ))}
          </div>
        )}
      </Section>

      <Section
        id="external-skills"
        title="external skills"
        count={fExternalSkills.length}
      >
        {fExternalSkills.length === 0 ? (
          <Empty />
        ) : (
          <ExternalGroups items={fExternalSkills} onTagClick={toggle} />
        )}
      </Section>

      <Section
        id="external-mcps"
        title="external mcps"
        count={fExternalMcps.length}
      >
        {fExternalMcps.length === 0 ? (
          <Empty />
        ) : (
          <ExternalGroups items={fExternalMcps} onTagClick={toggle} />
        )}
      </Section>

      <Section
        id="external-instructions"
        title="external instructions"
        count={fExternalInstructions.length}
      >
        {fExternalInstructions.length === 0 ? (
          <Empty />
        ) : (
          <ExternalGroups items={fExternalInstructions} onTagClick={toggle} />
        )}
      </Section>

      <Section id="archived" title="archived" count={archivedCount}>
        <p className="type-meta fg-muted">
          Retired from the synced set and parked in <code>archive/</code> - kept
          for reference, not pulled by Kasetto.
        </p>
        {archivedCount === 0 ? (
          <Empty />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fArchivedSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} onTagClick={toggle} />
            ))}
            {fArchivedInstructions.map((instruction) => (
              <InstructionCard
                key={instruction.id}
                instruction={instruction}
                onTagClick={toggle}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

// Tracks which section owns the viewport, so the sticky bar can mark it.
// Scroll position rather than IntersectionObserver: the last section is often
// shorter than the viewport and would never win an observer race.
function useActiveSection() {
  const [active, setActive] = useState(SECTION_IDS[0])

  useEffect(() => {
    const onScroll = () => {
      // Just below the sticky bar - the first line of content a reader sees
      const line = 96
      let current = SECTION_IDS[0]
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      setActive(atBottom ? SECTION_IDS[SECTION_IDS.length - 1] : current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return active
}

function TableOfContents({
  items,
}: {
  items: Array<{ id: string; label: string; count: number }>
}) {
  const active = useActiveSection()

  return (
    <nav
      aria-label="Sections"
      className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-bg-canvas/90 backdrop-blur-sm border-b border-ui"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="type-label fg-subtle">{'//'}</span>
        {items.map(({ id, label, count }) => {
          const isActive = active === id
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={isActive ? 'true' : undefined}
              className={`type-meta transition-colors ${
                isActive ? 'fg-primary' : 'fg-muted hover-primary'
              }${count === 0 ? ' opacity-40' : ''}`}
            >
              {label} <span className="fg-muted">({count})</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

function TagFilter({
  tags,
  active,
  onToggle,
}: {
  tags: Array<{ tag: string; count: number }>
  active: Set<string>
  onToggle: (tag: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map(({ tag }) => (
        <TagButton
          key={tag}
          active={active.has(tag)}
          onClick={() => onToggle(tag)}
        >
          {tag}
        </TagButton>
      ))}
    </div>
  )
}

function Section({
  id,
  title,
  count,
  children,
}: {
  id?: string
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <section id={id} className="space-y-3 scroll-mt-20">
      <SectionHeader title={title} count={count} />
      {children}
    </section>
  )
}

function Empty() {
  return (
    <p className="type-meta fg-muted py-3">No matches for the active tags.</p>
  )
}

function TagPill({
  tag,
  onClick,
}: {
  tag: string
  onClick: (tag: string) => void
}) {
  return (
    <TagButton
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick(tag)
      }}
    >
      {tag}
    </TagButton>
  )
}

function CardLinkHeader({ href, path }: { href: string; path: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="px-3 py-2 border-b border-faint flex items-center justify-between type-meta fg-muted hover-primary group"
    >
      <span className="truncate">{path}</span>
      <span className="opacity-60 group-hover:opacity-100 shrink-0 ml-2">
        ↗
      </span>
    </a>
  )
}

function SkillCard({
  skill,
  onTagClick,
}: {
  skill: Skill
  onTagClick: (tag: string) => void
}) {
  const dir = skill.archived ? 'archive/skills' : 'skills'
  const path = `${skill.sourceLabel}/${dir}/${skill.slug}`
  const href = `${skill.source}/tree/main/${dir}/${skill.slug}`
  return (
    <article
      className={`rounded border border-ui bg-bg-surface overflow-hidden flex flex-col${
        skill.archived ? ' opacity-60' : ''
      }`}
    >
      <CardLinkHeader href={href} path={path} />
      <div className="px-3 py-3 border-b border-faint space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(skill.tags)}`}
          />
          <span className="type-ui fg-primary font-semibold">{skill.name}</span>
          <div className="ml-auto flex flex-wrap gap-1 justify-end">
            {skill.tags.map((t) => (
              <TagPill key={t} tag={t} onClick={onTagClick} />
            ))}
          </div>
        </div>
        <p className="type-body fg-body pl-3.5 line-clamp-3 min-h-[3.9rem]">
          {skill.description || ' '}
        </p>
      </div>
    </article>
  )
}

function InstructionCard({
  instruction,
  onTagClick,
}: {
  instruction: Instruction
  onTagClick: (tag: string) => void
}) {
  const dir = instruction.archived ? 'archive/instructions' : 'instructions'
  const path = `${instruction.sourceLabel}/${dir}/${instruction.slug}.md`
  const href = `${instruction.source}/tree/main/${dir}/${instruction.slug}.md`
  return (
    <article
      className={`rounded border border-ui bg-bg-surface overflow-hidden flex flex-col${
        instruction.archived ? ' opacity-60' : ''
      }`}
    >
      <CardLinkHeader href={href} path={path} />
      <div className="px-3 py-3 border-b border-faint space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(instruction.tags)}`}
          />
          <span className="type-ui fg-primary font-semibold">
            {instruction.name}
          </span>
          <div className="ml-auto flex flex-wrap gap-1 justify-end">
            {instruction.tags.map((t) => (
              <TagPill key={t} tag={t} onClick={onTagClick} />
            ))}
          </div>
        </div>
        <p className="type-body fg-body pl-3.5 line-clamp-3 min-h-[3.9rem]">
          {instruction.description || ' '}
        </p>
      </div>
    </article>
  )
}

function McpCard({
  mcp,
  onTagClick,
}: {
  mcp: Mcp
  onTagClick: (tag: string) => void
}) {
  const path = `${mcp.sourceLabel}/mcps/${mcp.name}.json`
  const href = `${mcp.source}/tree/main/mcps/${mcp.name}.json`
  return (
    <article className="rounded border border-ui bg-bg-surface overflow-hidden flex flex-col">
      <CardLinkHeader href={href} path={path} />
      <div className="px-3 py-2.5 border-b border-faint flex items-center gap-2 flex-wrap">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(mcp.tags)}`}
        />
        <span className="type-ui fg-primary font-semibold">{mcp.name}</span>
        <div className="ml-auto flex flex-wrap gap-1 justify-end">
          {mcp.tags.map((t) => (
            <TagPill key={t} tag={t} onClick={onTagClick} />
          ))}
        </div>
      </div>
    </article>
  )
}

function ExternalGroups({
  items,
  onTagClick,
}: {
  items: Array<Skill | Mcp | Instruction>
  onTagClick: (tag: string) => void
}) {
  const grouped = new Map<string, Array<Skill | Mcp | Instruction>>()
  for (const item of items) {
    const list = grouped.get(item.sourceLabel) ?? []
    list.push(item)
    grouped.set(item.sourceLabel, list)
  }
  return (
    <div className="columns-1 md:columns-2 gap-3">
      {Array.from(grouped.entries()).map(([source, list]) => (
        <article
          key={source}
          className="rounded border border-ui bg-bg-surface overflow-hidden mb-3 break-inside-avoid"
        >
          <a
            href={`https://github.com/${source}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 border-b border-faint flex items-center justify-between type-meta fg-muted hover-primary group"
          >
            <span className="truncate">{source}</span>
            <span className="opacity-60 group-hover:opacity-100 shrink-0 ml-2">
              ↗
            </span>
          </a>
          <ul className="p-1">
            {list.map((item) => (
              <li
                key={item.id}
                className="px-2 py-1.5 type-meta fg-secondary flex items-center gap-2 rounded transition-colors flex-wrap"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(item.tags)}`}
                />
                <span className="fg-title truncate">{item.name}</span>
                {item.tags.length > 0 && (
                  <div className="ml-auto flex flex-wrap gap-1">
                    {item.tags.map((t) => (
                      <TagPill key={t} tag={t} onClick={onTagClick} />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}
