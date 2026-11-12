import type { Mcp, Skill } from '@/lib/data'
import { domainOf, groupOf } from '@/lib/domains'
import { GitFork, Plug } from 'lucide-react'
import type { CatalogEntry } from 'pivoshenko.ui'
import { EXTERNAL_ICON, FALLBACK_ICON, domainIcon } from './domain-icon'

function glyph(Icon: typeof FALLBACK_ICON) {
  return <Icon size={18} strokeWidth={2} aria-hidden="true" />
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

export function mcpEntry(mcp: Mcp): CatalogEntry {
  return {
    id: mcp.id,
    name: mcp.name,
    description: mcp.servers
      .map((server) => `${server.transport} - ${server.target}`)
      .join('\n'),
    tags: mcp.tags,
    local: mcp.local,
    icon: glyph(mcp.local ? Plug : GitFork),
    ...locate(mcp, `mcps/${mcp.name}.json`),
  }
}

export function archivedEntry(skill: Skill): CatalogEntry {
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    tags: skill.tags,
    local: skill.local,
    muted: true,
    // an archived skill has no live domain to inherit from
    icon: glyph(FALLBACK_ICON),
    // archived content is always ours, so it always resolves to a real path
    ...locate({ ...skill, local: true }, `archive/skills/${skill.slug}`),
  }
}
