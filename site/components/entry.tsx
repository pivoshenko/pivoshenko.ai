import type { Instruction, Mcp, Skill } from '@/lib/data'
import { domainOf, groupOf } from '@/lib/domains'
import { GitFork, Plug, ScrollText } from 'lucide-react'
import type { CatalogEntry } from 'pivoshenko.ui'
import { EXTERNAL_ICON, FALLBACK_ICON, domainIcon } from './domain-icon'

function glyph(Icon: typeof FALLBACK_ICON) {
  return <Icon size={18} strokeWidth={2} aria-hidden="true" />
}

// Where an entry comes from is the thing worth reading at a glance; what kind
// it is, the section it sits in already says
function icon(kind: 'mcp' | 'instruction', local: boolean) {
  return glyph(local ? { mcp: Plug, instruction: ScrollText }[kind] : GitFork)
}

// A skill takes its domain's icon, so every card in a sub-section carries the
// same mark and no two sub-sections carry the same one
function skillIcon(skill: Skill) {
  if (!skill.local) return glyph(EXTERNAL_ICON)
  const domain = domainOf(skill)
  return glyph(domain ? domainIcon[domain] : FALLBACK_ICON)
}

// We know where our own files sit; an external entry names a repository whose
// layout is its own business, so both the crumb and the link stop at it
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

export function skillEntry(skill: Skill): CatalogEntry {
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    tags: skill.tags,
    local: skill.local,
    group: groupOf(skill),
    icon: skillIcon(skill),
    ...locate(skill, `skills/${skill.slug}`),
  }
}

export function instructionEntry(instruction: Instruction): CatalogEntry {
  return {
    id: instruction.id,
    name: instruction.name,
    description: instruction.description,
    tags: instruction.tags,
    local: instruction.local,
    icon: icon('instruction', instruction.local),
    ...locate(instruction, `instructions/${instruction.slug}.md`),
  }
}

export function mcpEntry(mcp: Mcp): CatalogEntry {
  return {
    id: mcp.id,
    name: mcp.name,
    description: mcp.servers
      .map((server) => `${server.transport} - ${server.target}`)
      .join('\n'),
    tags: mcp.tags,
    local: mcp.local,
    icon: icon('mcp', mcp.local),
    ...locate(mcp, `mcps/${mcp.name}.json`),
  }
}

export function archivedEntry(item: Skill | Instruction): CatalogEntry {
  const isSkill = item.id.startsWith('skill:')
  const leaf = isSkill
    ? `archive/skills/${item.slug}`
    : `archive/instructions/${item.slug}.md`
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    tags: item.tags,
    local: item.local,
    muted: true,
    // an archived skill has no live domain to inherit from
    icon: isSkill ? glyph(FALLBACK_ICON) : icon('instruction', item.local),
    // archived content is always ours, so it always resolves to a real path
    ...locate({ ...item, local: true }, leaf),
  }
}
