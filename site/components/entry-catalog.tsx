'use client'

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
import type { Entry } from './entry'

type EntryCatalogProps = {
  id: string
  title: string
  entries: Entry[]
  archived?: Entry[]
  /** Minimum card track width; the row fits as many as the container allows */
  min?: string
  /** A handful of entries reads faster unfiltered than it does behind a bar */
  filters?: boolean
}

export function EntryCatalog({
  id,
  title,
  entries,
  archived = [],
  min = '340px',
  filters: withFilters,
}: EntryCatalogProps) {
  const [active, setActive] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [origin, setOrigin] = useState<Origin>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [opened, setOpened] = useState<Entry | null>(null)

  const tags = useMemo(
    () => countTags([...entries, ...archived]),
    [entries, archived],
  )

  const needle = query.trim().toLowerCase()

  // Tags are an OR within themselves and an AND against search and origin, so
  // narrowing by one never silently widens another
  const keep = (items: Entry[]) =>
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
  const showFilters = withFilters ?? entries.length + archived.length > 12

  const reset = () => {
    setActive(new Set())
    setQuery('')
    setOrigin('all')
  }

  const shown = keep(entries)
  const shownArchived = keep(archived)
  const own = shown.filter((entry) => entry.local)
  const external = shown.filter((entry) => !entry.local)
  const hasExternal = entries.some((entry) => !entry.local)

  return (
    <div className="space-y-10">
      {showFilters && (
        <section id="filters" className="scroll-mt-24 space-y-2">
          <SectionHeader
            title="Filters"
            count={tags.length}
            action={
              <div className="flex items-center gap-2">
                {hasExternal && (
                  <OriginMenu origin={origin} onOrigin={setOrigin} />
                )}
                {filtered && <ResetButton onClick={reset} />}
              </div>
            }
          />
          <div className="space-y-4">
            <SearchBar query={query} onQuery={setQuery} />
            <TagFilter tags={tags} active={active} onToggle={toggle} />
          </div>
        </section>
      )}

      <section id={id} className="scroll-mt-24 space-y-2">
        <SectionHeader title={title} count={shown.length} />
        {shown.length === 0 ? (
          <NoMatches />
        ) : (
          <div className="space-y-8">
            {own.length > 0 && (
              <Block
                label={hasExternal ? 'own' : undefined}
                count={own.length}
                entries={own}
                min={min}
                onOpen={setOpened}
              />
            )}
            {external.length > 0 && (
              <Block
                label="external"
                count={external.length}
                entries={external}
                min={min}
                onOpen={setOpened}
              />
            )}
          </div>
        )}
      </section>

      {archived.length > 0 && (
        <section id="archived" className="scroll-mt-24 space-y-2">
          <SectionHeader
            title="Archived"
            count={shownArchived.length}
            action={
              <ToggleButton
                shown={showArchived}
                onClick={() => setShowArchived((prev) => !prev)}
              />
            }
          />
          {!showArchived ? null : shownArchived.length === 0 ? (
            <NoMatches />
          ) : (
            <CardGrid min={min}>
              {shownArchived.map((entry) => (
                <ItemCard key={entry.id} entry={entry} onOpen={setOpened} />
              ))}
            </CardGrid>
          )}
        </section>
      )}

      <ItemDialog
        entry={opened}
        onClose={() => setOpened(null)}
        onTagClick={toggle}
      />
    </div>
  )
}

// == Cards ==

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

function Block({
  label,
  count,
  entries,
  min,
  onOpen,
}: {
  label?: string
  count: number
  entries: Entry[]
  min: string
  onOpen: (entry: Entry) => void
}) {
  return (
    <div className="space-y-4">
      {label && <SubHead label={label} count={count} />}
      <CardGrid min={min}>
        {entries.map((entry) => (
          <ItemCard key={entry.id} entry={entry} onOpen={onOpen} />
        ))}
      </CardGrid>
    </div>
  )
}

// The card is a trigger and nothing else. Everything wordy - the description,
// the filterable tags, the source link - lives in the dialog it opens, so a
// grid of sixty reads as a list rather than a wall
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
      className={entry.archived ? 'opacity-70' : undefined}
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
        className="flex-none transition-[color,transform] duration-base ease-out group-hover:translate-x-0.5 group-hover:text-accent motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      />
    </a>
  )
}

// == Filtering ==

type Origin = 'all' | 'own' | 'external'

const originLabels: Record<Origin, string> = {
  all: 'All sources',
  own: 'Own only',
  external: 'External only',
}

function matchesOrigin(entry: Entry, origin: Origin) {
  if (origin === 'own') return entry.local
  if (origin === 'external') return !entry.local
  return true
}

// Searches everything a card or its dialog can show, so a hit is always
// explicable - the term is visible somewhere once you open the entry
function matchesQuery(entry: Entry, needle: string) {
  if (needle === '') return true
  return [entry.name, entry.description, entry.path, ...entry.tags]
    .join(' ')
    .toLowerCase()
    .includes(needle)
}

function SearchBar({
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
      aria-label="Search"
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

// == Chrome ==

const barButton =
  'type-meta fg-subtle hover-primary focus-ring border-card bg-bg-sunken inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 transition-colors duration-fast hover:border-accent'

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={barButton}>
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
      className={barButton}
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

function NoMatches() {
  return (
    <EmptyState
      icon={<SearchX size={20} strokeWidth={2} aria-hidden="true" />}
      title="Nothing here"
      description="No entry matches the current search, source and tags."
    />
  )
}

function countTags(items: Entry[]) {
  const counts = new Map<string, number>()
  for (const item of items) {
    for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag),
  )
}
