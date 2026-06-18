import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { MCP_TAGS, SKILL_TAGS, SOURCE_TAGS } from './external-tags'

const ROOT = join(process.cwd(), '..')
const LOCAL_SOURCE = 'https://github.com/pivoshenko/pivoshenko.ai'
const LOCAL_LABEL = 'pivoshenko/pivoshenko.ai'

export type Skill = {
  id: string
  slug: string
  name: string
  description: string
  source: string
  sourceLabel: string
  local: boolean
  tags: string[]
  updated_at?: string
}

export type Mcp = {
  id: string
  name: string
  source: string
  sourceLabel: string
  local: boolean
  tags: string[]
  updated_at?: string
}

export type KasettoConfig = {
  agent: string[]
  skills: Array<{
    source: string
    'sub-dir'?: string
    skills: '*' | string[]
  }>
  mcps: Array<{
    source: string
    mcps: '*' | string[]
  }>
}

function parseFrontmatter(md: string): Record<string, unknown> {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  return (parseYaml(m[1]) as Record<string, unknown>) ?? {}
}

function labelForSource(source: string): string {
  const m = source.match(/github\.com\/([^/]+\/[^/]+)/)
  if (!m) return source
  return m[1].replace(/\.git$/, '')
}

function deriveSkillTags(slug: string, sourceLabel: string): string[] {
  const tags = new Set<string>()
  for (const t of SKILL_TAGS[slug] ?? []) tags.add(t)
  for (const t of SOURCE_TAGS[sourceLabel] ?? []) tags.add(t)
  return Array.from(tags)
}

function readKasetto(): KasettoConfig {
  const raw = readFileSync(join(ROOT, 'kasetto.yaml'), 'utf8')
  return parseYaml(raw) as KasettoConfig
}

function readLocalSkills(): Skill[] {
  const skillsDir = join(ROOT, 'skills')
  const entries = readdirSync(skillsDir).filter((name) =>
    statSync(join(skillsDir, name)).isDirectory(),
  )
  return entries.map((slug) => {
    const md = readFileSync(join(skillsDir, slug, 'SKILL.md'), 'utf8')
    const data = parseFrontmatter(md)
    const frontmatterTags = Array.isArray(data.tags)
      ? (data.tags as string[]).map(String)
      : []
    return {
      id: `skill:${slug}`,
      slug,
      name: (data.name as string) ?? slug,
      description: (data.description as string) ?? '',
      source: LOCAL_SOURCE,
      sourceLabel: LOCAL_LABEL,
      local: true,
      tags: frontmatterTags.length
        ? frontmatterTags
        : deriveSkillTags(slug, LOCAL_LABEL),
      updated_at:
        typeof data.updated_at === 'string' ? data.updated_at : undefined,
    }
  })
}

function readLocalMcps(): Mcp[] {
  const mcpsDir = join(ROOT, 'mcps')
  const entries = readdirSync(mcpsDir).filter((name) => name.endsWith('.json'))
  return entries.map((file) => {
    const name = file.replace(/\.json$/, '')
    return {
      id: `mcp:${name}`,
      name,
      source: LOCAL_SOURCE,
      sourceLabel: LOCAL_LABEL,
      local: true,
      tags: deriveMcpTags(name, LOCAL_LABEL),
    }
  })
}

function deriveMcpTags(name: string, sourceLabel: string): string[] {
  const tags = new Set<string>()
  for (const t of MCP_TAGS[name] ?? []) tags.add(t)
  for (const t of SOURCE_TAGS[sourceLabel] ?? []) tags.add(t)
  return Array.from(tags)
}

function readExternalSkills(
  config: KasettoConfig,
  localSlugs: Set<string>,
): Skill[] {
  const out: Skill[] = []
  for (const entry of config.skills) {
    const label = labelForSource(entry.source)
    if (label === LOCAL_LABEL) continue
    if (entry.skills === '*') {
      out.push({
        id: `skill:wildcard:${label}`,
        slug: '*',
        name: 'all skills',
        description: `All skills published in ${label}`,
        source: entry.source,
        sourceLabel: label,
        local: false,
        tags: deriveSkillTags('*', label),
      })
      continue
    }
    for (const slug of entry.skills) {
      if (localSlugs.has(slug)) continue
      out.push({
        id: `skill:${label}:${slug}`,
        slug,
        name: slug,
        description: '',
        source: entry.source,
        sourceLabel: label,
        local: false,
        tags: deriveSkillTags(slug, label),
      })
    }
  }
  return out
}

function readExternalMcps(
  config: KasettoConfig,
  localNames: Set<string>,
): Mcp[] {
  const out: Mcp[] = []
  for (const entry of config.mcps) {
    const label = labelForSource(entry.source)
    if (label === LOCAL_LABEL) continue
    if (entry.mcps === '*') {
      out.push({
        id: `mcp:wildcard:${label}`,
        name: 'all mcps',
        source: entry.source,
        sourceLabel: label,
        local: false,
        tags: [],
      })
      continue
    }
    for (const name of entry.mcps) {
      if (localNames.has(name)) continue
      out.push({
        id: `mcp:${label}:${name}`,
        name,
        source: entry.source,
        sourceLabel: label,
        local: false,
        tags: deriveMcpTags(name, label),
      })
    }
  }
  return out
}

export function loadCatalog() {
  const config = readKasetto()
  const localSkills = readLocalSkills()
  const localMcps = readLocalMcps()
  const externalSkills = readExternalSkills(
    config,
    new Set(localSkills.map((s) => s.slug)),
  )
  const externalMcps = readExternalMcps(
    config,
    new Set(localMcps.map((m) => m.name)),
  )

  const skills = [...localSkills, ...externalSkills].sort(byUpdatedAtDesc)
  const mcps = [...localMcps, ...externalMcps].sort(byUpdatedAtDesc)

  return {
    config,
    skills,
    mcps,
    sources: Array.from(
      new Set([...skills, ...mcps].map((item) => item.sourceLabel)),
    ).sort(),
  }
}

function byUpdatedAtDesc<T extends { updated_at?: string; name: string }>(
  a: T,
  b: T,
): number {
  if (a.updated_at && b.updated_at && a.updated_at !== b.updated_at) {
    return b.updated_at.localeCompare(a.updated_at)
  }
  if (a.updated_at && !b.updated_at) return -1
  if (!a.updated_at && b.updated_at) return 1
  return a.name.localeCompare(b.name)
}
