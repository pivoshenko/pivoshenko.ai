'use client'

import type { Instruction, Mcp, Plugin, Skill } from '@/lib/data'
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Filter,
  GitFork,
  Plug,
  RotateCcw,
  ScrollText,
  SearchX,
  Sparkles,
} from 'lucide-react'
import {
  Card,
  CardGrid,
  Dialog,
  EmptyState,
  Menu,
  MenuItem,
  SearchField,
  SectionHeader,
  Tag,
  TagButton,
  Tags,
} from 'pivoshenko.ui'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PluginShowcase } from './plugin-showcase'

type CatalogProps = {
  skills: Skill[]
  mcps: Mcp[]
  instructions: Instruction[]
  plugins: Plugin[]
  archivedSkills: Skill[]
  archivedInstructions: Instruction[]
}

export function Catalog({
  skills,
  mcps,
  instructions,
  plugins,
  archivedSkills,
  archivedInstructions,
}: CatalogProps) {
  const [active, setActive] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [origin, setOrigin] = useState<Origin>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [opened, setOpened] = useState<Entry | null>(null)

  const tags = useMemo(
    () =>
      countTags([
        ...skills,
        ...mcps,
        ...instructions,
        ...plugins,
        ...archivedSkills,
        ...archivedInstructions,
      ]),
    [skills, mcps, instructions, plugins, archivedSkills, archivedInstructions],
  )

  const needle = query.trim().toLowerCase()

  // Tags are an OR within themselves and an AND against search and origin, so
  // narrowing by one never silently widens another
  const keep = <T extends { tags: string[]; local: boolean }>(items: T[]) =>
    items.filter(
      (item) =>
        (active.size === 0 || item.tags.some((tag) => active.has(tag))) &&
        matchesOrigin(item, origin) &&
        matchesQuery(item, needle),
    )

  const toggle = (tag: string) =>
    setActive((prev) => {
      const next = new Set(prev)
      if (!next.delete(tag)) next.add(tag)
      return next
    })

  const filtered = active.size > 0 || needle !== '' || origin !== 'all'

  const reset = () => {
    setActive(new Set())
    setQuery('')
    setOrigin('all')
  }

  const shownSkills = keep(skills).map(skillEntry)
  const shownMcps = keep(mcps).map(mcpEntry)
  const shownInstructions = keep(instructions).map(instructionEntry)
  const shownPlugins = keep(plugins)
  const shownArchived = [
    ...keep(archivedSkills),
    ...keep(archivedInstructions),
  ].map(archivedEntry)

  return (
    <div className="space-y-10">
      <Group
        id="filters"
        title="Filters"
        count={tags.length}
        action={
          <div className="flex items-center gap-2">
            <OriginMenu origin={origin} onOrigin={setOrigin} />
            {filtered && <ResetButton onClick={reset} />}
          </div>
        }
      >
        <div className="space-y-4">
          <FilterBar query={query} onQuery={setQuery} />
          <TagFilter tags={tags} active={active} onToggle={toggle} />
        </div>
      </Group>

      <Group id="skills" title="Skills" count={shownSkills.length}>
        <Split entries={shownSkills} onOpen={setOpened} />
      </Group>

      <Group id="mcps" title="MCPs" count={shownMcps.length}>
        <Split entries={shownMcps} min="240px" onOpen={setOpened} />
      </Group>

      <Group
        id="instructions"
        title="Instructions"
        count={shownInstructions.length}
      >
        <Split entries={shownInstructions} onOpen={setOpened} />
      </Group>

      <Group id="plugins" title="Plugins" count={shownPlugins.length}>
        {shownPlugins.length === 0 ? (
          <NoMatches />
        ) : (
          <div className="space-y-16">
            {shownPlugins.map((plugin) => (
              <PluginShowcase key={plugin.id} plugin={plugin} />
            ))}
          </div>
        )}
      </Group>

      <Group
        id="archived"
        title="Archived"
        count={shownArchived.length}
        action={
          <ToggleButton
            shown={showArchived}
            onClick={() => setShowArchived((prev) => !prev)}
          />
        }
      >
        {!showArchived ? null : shownArchived.length === 0 ? (
          <NoMatches />
        ) : (
          <CardGrid min="340px">
            {shownArchived.map((entry) => (
              <ItemCard key={entry.id} entry={entry} onOpen={setOpened} />
            ))}
          </CardGrid>
        )}
      </Group>

      <ItemDialog
        entry={opened}
        onClose={() => setOpened(null)}
        onTagClick={toggle}
      />
    </div>
  )
}

// == Entries ==

// One shape for every kind, so the card and the dialog only ever read one thing
type Entry = {
  id: string
  kind: 'skill' | 'mcp' | 'instruction'
  name: string
  description: string
  path: string
  href: string
  tags: string[]
  local: boolean
  dim?: boolean
}

const glyphs: Record<Entry['kind'], ReactNode> = {
  skill: <Sparkles size={14} strokeWidth={2} aria-hidden="true" />,
  mcp: <Plug size={14} strokeWidth={2} aria-hidden="true" />,
  instruction: <ScrollText size={14} strokeWidth={2} aria-hidden="true" />,
}

// Where an entry comes from is the thing worth reading at a glance; what kind
// it is, the section it sits in already says
function glyphFor(entry: Entry): ReactNode {
  return entry.local ? (
    glyphs[entry.kind]
  ) : (
    <GitFork size={14} strokeWidth={2} aria-hidden="true" />
  )
}

// We know where our own files sit; an external entry names a repository whose
// layout is its own business, so both the crumb and the link stop at the repository
function locate(
  item: { local: boolean; source: string; sourceLabel: string },
  leaf: string,
) {
  return item.local
    ? {
        path: `${item.sourceLabel}/${leaf}`,
        href: `${item.source}/tree/main/${leaf}`,
      }
    : { path: item.sourceLabel, href: item.source }
}

function skillEntry(skill: Skill): Entry {
  return {
    id: skill.id,
    kind: 'skill',
    name: skill.name,
    description: skill.description,
    tags: skill.tags,
    local: skill.local,
    ...locate(skill, `skills/${skill.slug}`),
  }
}

function instructionEntry(instruction: Instruction): Entry {
  return {
    id: instruction.id,
    kind: 'instruction',
    name: instruction.name,
    description: instruction.description,
    tags: instruction.tags,
    local: instruction.local,
    ...locate(instruction, `instructions/${instruction.slug}.md`),
  }
}

function mcpEntry(mcp: Mcp): Entry {
  return {
    id: mcp.id,
    kind: 'mcp',
    name: mcp.name,
    description: '',
    tags: mcp.tags,
    local: mcp.local,
    ...locate(mcp, `mcps/${mcp.name}.json`),
  }
}

function archivedEntry(item: Skill | Instruction): Entry {
  const isSkill = item.id.startsWith('skill:')
  const leaf = isSkill
    ? `archive/skills/${item.slug}`
    : `archive/instructions/${item.slug}.md`
  return {
    id: item.id,
    kind: isSkill ? 'skill' : 'instruction',
    name: item.name,
    description: item.description,
    tags: item.tags,
    local: item.local,
    dim: true,
    ...locate({ ...item, local: true }, leaf),
  }
}

// == Cards ==

// The card is a trigger and nothing else. Everything wordy - the description,
// the filterable tags, the source link - lives in the dialog it opens, so a
// row of sixty reads as a list rather than a wall
function ItemCard({
  entry,
  onOpen,
}: {
  entry: Entry
  onOpen: (entry: Entry) => void
}) {
  return (
    <Card
      glyph={glyphFor(entry)}
      title={entry.name}
      eyebrow={entry.path}
      onClick={() => onOpen(entry)}
      className={entry.dim ? 'opacity-70' : undefined}
    >
      <Tags className="mt-3">
        {entry.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Tags>
    </Card>
  )
}

function ItemDialog({
  entry,
  onClose,
  onTagClick,
}: {
  entry: Entry | null
  onClose: () => void
  onTagClick: (tag: string) => void
}) {
  return (
    <Dialog
      open={entry != null}
      onClose={onClose}
      glyph={entry ? glyphFor(entry) : undefined}
      eyebrow={entry && <SourceLink entry={entry} />}
      title={entry?.name ?? ''}
    >
      <p className="type-body fg-body m-0 whitespace-pre-line">
        {entry?.description || 'No description published for this entry.'}
      </p>

      {entry && entry.tags.length > 0 && (
        <Tags>
          {entry.tags.map((tag) => (
            <TagButton
              key={tag}
              onClick={() => {
                onTagClick(tag)
                onClose()
              }}
            >
              {tag}
            </TagButton>
          ))}
        </Tags>
      )}
    </Dialog>
  )
}

// The path is the link - a separate button would say the same thing twice
function SourceLink({ entry }: { entry: Entry }) {
  return (
    <a
      href={entry.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fg-subtle hover-primary focus-ring inline-flex items-center gap-1.5 rounded-sm no-underline transition-colors duration-fast"
    >
      <span aria-hidden="true" className="text-accent">
        {'//'}
      </span>
      <span className="[overflow-wrap:anywhere]">{entry.path}</span>
      <ArrowUpRight
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className="flex-none transition-[color,transform] duration-base ease-out group-hover:text-accent group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      />
    </a>
  )
}

// == Grouping ==

type GroupProps = {
  id: string
  title: string
  count: number
  action?: ReactNode
  children: ReactNode
}

function Group({ id, title, count, action, children }: GroupProps) {
  return (
    <section id={id} className="scroll-mt-24 space-y-2">
      <SectionHeader title={title} count={count} action={action} />
      {children}
    </section>
  )
}

type SplitProps = {
  entries: Entry[]
  /** Minimum card track width; the row fits as many as the container allows */
  min?: string
  onOpen: (entry: Entry) => void
}

// Authored here and pulled in from elsewhere are the same kind of thing and get
// the same card; only the eyebrow's repository differs
function Split({ entries, min = '340px', onOpen }: SplitProps) {
  const own = entries.filter((entry) => entry.local)
  const external = entries.filter((entry) => !entry.local)

  if (entries.length === 0) return <NoMatches />

  return (
    <div className="space-y-8">
      {own.length > 0 && (
        <div className="space-y-4">
          <SubHead label="own" count={own.length} />
          <CardGrid min={min}>
            {own.map((entry) => (
              <ItemCard key={entry.id} entry={entry} onOpen={onOpen} />
            ))}
          </CardGrid>
        </div>
      )}
      {external.length > 0 && (
        <div className="space-y-4">
          <SubHead label="external" count={external.length} />
          <CardGrid min={min}>
            {external.map((entry) => (
              <ItemCard key={entry.id} entry={entry} onOpen={onOpen} />
            ))}
          </CardGrid>
        </div>
      )}
    </div>
  )
}

function SubHead({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="type-label fg-subtle">
        <span aria-hidden="true" className="text-accent">
          {'//'}
        </span>{' '}
        {label}
      </span>
      <span className="type-meta fg-muted bg-bg-raised rounded-full px-1.5 leading-[18px]">
        {count}
      </span>
      <span aria-hidden="true" className="rule-dashed h-px flex-1" />
    </div>
  )
}

function ToggleButton({
  shown,
  onClick,
}: {
  shown: boolean
  onClick: () => void
}) {
  const Icon = shown ? EyeOff : Eye
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={shown}
      aria-controls="archived"
      className="type-meta fg-subtle hover-primary focus-ring border-card bg-bg-sunken inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors duration-fast hover:border-accent"
    >
      <Icon
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className="text-accent"
      />
      {shown ? 'Hide' : 'Show'}
    </button>
  )
}

// == Filtering ==

type Origin = 'all' | 'own' | 'external'

const originLabels: Record<Origin, string> = {
  all: 'All sources',
  own: 'Own only',
  external: 'External only',
}

function matchesOrigin(item: { local: boolean }, origin: Origin) {
  if (origin === 'own') return item.local
  if (origin === 'external') return !item.local
  return true
}

// Searches everything a card or its dialog can show, so a hit is always
// explicable - the term is visible somewhere once you open the entry
function matchesQuery(
  item: { tags: string[]; name?: string; description?: string; slug?: string },
  needle: string,
) {
  if (needle === '') return true
  const haystack = [
    item.name ?? '',
    item.description ?? '',
    item.slug ?? '',
    ...item.tags,
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(needle)
}

function FilterBar({
  query,
  onQuery,
}: {
  query: string
  onQuery: (value: string) => void
}) {
  const field = useRef<HTMLInputElement>(null)

  // "/" jumps to the field, the way every search-first page on the web does,
  // but not while the caret is already in something typable
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey) return
      const el = document.activeElement
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return
      }
      event.preventDefault()
      field.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <SearchField
      ref={field}
      value={query}
      onChange={(event) => onQuery(event.target.value)}
      placeholder="Name, description, tag"
      aria-label="Search the catalog"
      hint="/"
      className="w-full"
    />
  )
}

function OriginMenu({
  origin,
  onOrigin,
}: {
  origin: Origin
  onOrigin: (value: Origin) => void
}) {
  return (
    <Menu
      align="end"
      label={originLabels[origin]}
      icon={<Filter size={14} strokeWidth={2} aria-hidden="true" />}
    >
      {(Object.keys(originLabels) as Origin[]).map((value) => (
        <MenuItem
          key={value}
          selected={origin === value}
          onClick={() => onOrigin(value)}
        >
          {originLabels[value]}
        </MenuItem>
      ))}
    </Menu>
  )
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="type-meta fg-subtle hover-primary focus-ring border-card bg-bg-sunken inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors duration-fast hover:border-accent"
    >
      <RotateCcw
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className="text-accent"
      />
      Reset
    </button>
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
    <Tags aria-label="Filter by tag">
      {tags.map(({ tag, count }) => (
        <TagButton
          key={tag}
          count={count}
          active={active.has(tag)}
          onClick={() => onToggle(tag)}
        >
          {tag}
        </TagButton>
      ))}
    </Tags>
  )
}

function NoMatches() {
  return (
    <EmptyState
      icon={<SearchX size={20} strokeWidth={2} aria-hidden="true" />}
      title="Nothing here"
      description="No entry in this section carries one of the active tags."
    />
  )
}

function countTags(items: Array<{ tags: string[] }>) {
  const counts = new Map<string, number>()
  for (const item of items) {
    for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag),
  )
}
