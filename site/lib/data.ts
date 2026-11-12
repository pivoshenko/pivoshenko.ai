import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
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
  archived?: boolean
  tags: string[]
  updated_at?: string
}

export type McpServer = {
  name: string
  transport: 'http' | 'stdio'
  /** Endpoint for http, or the launched binary for stdio */
  target: string
  /** Placeholder names only - Kasetto substitutes the real secrets on sync */
  secrets: string[]
}

export type Mcp = {
  id: string
  name: string
  source: string
  sourceLabel: string
  local: boolean
  tags: string[]
  servers: McpServer[]
  /** The definition as published, for the config panel */
  config?: string
}

export type Instruction = {
  id: string
  slug: string
  name: string
  description: string
  source: string
  sourceLabel: string
  local: boolean
  archived?: boolean
  tags: string[]
  updated_at?: string
}

export type KasettoConfig = {
  skills: Array<{
    source: string
    'sub-dir'?: string
    skills: '*' | string[]
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

function deriveTags(
  table: Record<string, string[]>,
  slug: string,
  sourceLabel: string,
): string[] {
  const tags = new Set<string>()
  for (const t of table[slug] ?? []) tags.add(t)
  for (const t of SOURCE_TAGS[sourceLabel] ?? []) tags.add(t)
  return Array.from(tags)
}

function readKasetto(): KasettoConfig {
  const raw = readFileSync(join(ROOT, 'kasetto.yaml'), 'utf8')
  return parseYaml(raw) as KasettoConfig
}

function readLocalSkills(baseDir = 'skills', archived = false): Skill[] {
  const skillsDir = join(ROOT, baseDir)
  if (!existsSync(skillsDir)) return []
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
      id: `skill:${archived ? 'archived:' : ''}${slug}`,
      slug,
      name: (data.name as string) ?? slug,
      description: (data.description as string) ?? '',
      source: LOCAL_SOURCE,
      sourceLabel: LOCAL_LABEL,
      local: true,
      archived,
      tags: frontmatterTags.length
        ? frontmatterTags
        : deriveTags(SKILL_TAGS, slug, LOCAL_LABEL),
      updated_at:
        typeof data.updated_at === 'string' ? data.updated_at : undefined,
    }
  })
}

// Secrets in a definition are Kasetto placeholders (${kst_*}) rather than
// literals, so the config is safe to publish as written
function readServers(config: string): McpServer[] {
  let parsed: {
    mcpServers?: Record<
      string,
      { url?: string; command?: string; args?: string[]; headers?: unknown }
    >
  }
  try {
    parsed = JSON.parse(config)
  } catch {
    return []
  }
  return Object.entries(parsed.mcpServers ?? {}).map(([name, server]) => ({
    name,
    transport: server.url ? ('http' as const) : ('stdio' as const),
    target: server.url ?? [server.command, ...(server.args ?? [])].join(' '),
    secrets: Array.from(
      new Set(
        Array.from(
          JSON.stringify(server).matchAll(/\$\{([A-Za-z0-9_]+)\}/g),
          (m) => m[1],
        ),
      ),
    ),
  }))
}

function readLocalMcps(): Mcp[] {
  const mcpsDir = join(ROOT, 'mcps')
  const entries = readdirSync(mcpsDir).filter((name) => name.endsWith('.json'))
  return entries.map((file) => {
    const name = file.replace(/\.json$/, '')
    const config = readFileSync(join(mcpsDir, file), 'utf8').trimEnd()
    return {
      id: `mcp:${name}`,
      name,
      source: LOCAL_SOURCE,
      sourceLabel: LOCAL_LABEL,
      local: true,
      tags: deriveTags(MCP_TAGS, name, LOCAL_LABEL),
      servers: readServers(config),
      config,
    }
  })
}

function readLocalInstructions(
  baseDir = 'instructions',
  archived = false,
): Instruction[] {
  const dir = join(ROOT, baseDir)
  if (!existsSync(dir)) return []
  const entries = readdirSync(dir).filter((name) => name.endsWith('.md'))
  return entries.map((file) => {
    const slug = file.replace(/\.md$/, '')
    const data = parseFrontmatter(readFileSync(join(dir, file), 'utf8'))
    const frontmatterTags = Array.isArray(data.tags)
      ? (data.tags as string[]).map(String)
      : []
    return {
      id: `instruction:${archived ? 'archived:' : ''}${slug}`,
      slug,
      name: (data.name as string) ?? slug,
      description: (data.description as string) ?? '',
      source: LOCAL_SOURCE,
      sourceLabel: LOCAL_LABEL,
      local: true,
      archived,
      tags: frontmatterTags.length
        ? frontmatterTags
        : deriveTags({}, slug, LOCAL_LABEL),
      updated_at:
        typeof data.updated_at === 'string' ? data.updated_at : undefined,
    }
  })
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
        tags: deriveTags(SKILL_TAGS, '*', label),
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
        tags: deriveTags(SKILL_TAGS, slug, label),
      })
    }
  }
  return out
}

export type Catalog = ReturnType<typeof readCatalog>

// The catalog is a build-time projection of the repository and never changes within a
// build, so the layout and the page can both ask for it without re-walking
let cached: Catalog | undefined

export function loadCatalog(): Catalog {
  cached ??= readCatalog()
  return cached
}

function readCatalog() {
  const config = readKasetto()
  const localSkills = readLocalSkills()
  const localMcps = readLocalMcps()
  const localInstructions = readLocalInstructions()
  const archivedSkills = readLocalSkills('archive/skills', true).sort(
    byUpdatedAtDesc,
  )
  const archivedInstructions = readLocalInstructions(
    'archive/instructions',
    true,
  ).sort(byUpdatedAtDesc)
  const externalSkills = readExternalSkills(
    config,
    new Set(localSkills.map((s) => s.slug)),
  )

  const skills = [...localSkills, ...externalSkills].sort(byUpdatedAtDesc)

  return {
    skills,
    mcps: localMcps,
    instructions: localInstructions.sort(byUpdatedAtDesc),
    archivedSkills,
    archivedInstructions,
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
