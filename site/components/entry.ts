import type { Instruction, Mcp, Skill } from '@/lib/data'

// One shape for every kind of catalog item, so a card, a dialog and a filter
// only ever read one thing
export type Entry = {
  id: string
  kind: 'skill' | 'mcp' | 'instruction'
  name: string
  description: string
  path: string
  href: string
  tags: string[]
  local: boolean
  archived?: boolean
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

export function skillEntry(skill: Skill): Entry {
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

export function instructionEntry(instruction: Instruction): Entry {
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

export function mcpEntry(mcp: Mcp): Entry {
  return {
    id: mcp.id,
    kind: 'mcp',
    name: mcp.name,
    description: mcp.servers
      .map((server) => `${server.transport} - ${server.target}`)
      .join('\n'),
    tags: mcp.tags,
    local: mcp.local,
    ...locate(mcp, `mcps/${mcp.name}.json`),
  }
}

export function archivedEntry(item: Skill | Instruction): Entry {
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
    archived: true,
    // archived content is always ours, so it always resolves to a real path
    ...locate({ ...item, local: true }, leaf),
  }
}
