import type { Skill } from './data'

export type Domain = 'git' | 'spec' | 'writing' | 'cloud' | 'macos' | 'agents'

// Tags are flat and overlapping - a skill is tagged `spec` and `openspec` and
// `agents` at once - so the domain is the first tag that maps, in this order.
// Deliberately hand-kept rather than derived: the grouping is an editorial
// claim about what a skill is for, and a new tag should not silently reshape it
const DOMAIN_OF: Array<[string, Domain]> = [
  ['git', 'git'],
  ['github', 'git'],
  ['spec', 'spec'],
  ['openspec', 'spec'],
  ['writing', 'writing'],
  ['blog', 'writing'],
  ['wiki', 'writing'],
  ['obsidian', 'writing'],
  ['cloudflare', 'cloud'],
  ['vercel', 'cloud'],
  ['nextjs', 'cloud'],
  ['macos', 'macos'],
  ['herdr', 'agents'],
  ['agents', 'agents'],
]

export const DOMAIN_ORDER: Domain[] = [
  'git',
  'spec',
  'writing',
  'cloud',
  'macos',
  'agents',
]

// The same buckets the skill map draws, so the diagram and the catalog under
// it agree. An external skill has no domain - its tags describe the upstream
// repository's concerns, not ours - so it files under that repository instead
export function groupOf(skill: Skill): string {
  return skill.local ? (domainOf(skill) ?? 'elsewhere') : skill.sourceLabel
}

// Own domains first, in the map's order, then the upstream repositories,
// largest first - so the page reads outward from what is mine
export function byGroup(skills: Skill[]): Skill[] {
  const rank = new Map<string, number>()
  for (const skill of skills) {
    const group = groupOf(skill)
    if (rank.has(group)) continue
    const own = DOMAIN_ORDER.indexOf(group as Domain)
    rank.set(group, own === -1 ? 100 : own)
  }
  const size = new Map<string, number>()
  for (const skill of skills) {
    const group = groupOf(skill)
    size.set(group, (size.get(group) ?? 0) + 1)
  }
  return [...skills].sort((a, b) => {
    const ga = groupOf(a)
    const gb = groupOf(b)
    if (ga === gb) return a.name.localeCompare(b.name)
    const ra = rank.get(ga) ?? 100
    const rb = rank.get(gb) ?? 100
    if (ra !== rb) return ra - rb
    const sa = size.get(ga) ?? 0
    const sb = size.get(gb) ?? 0
    return sb - sa || ga.localeCompare(gb)
  })
}

export function domainOf(skill: Skill): Domain | undefined {
  for (const [tag, domain] of DOMAIN_OF) {
    if (skill.tags.includes(tag)) return domain
  }
  return undefined
}

export type DomainGroup = { domain: Domain; skills: Skill[] }

export function groupByDomain(skills: Skill[]): DomainGroup[] {
  const groups = new Map<Domain, Skill[]>()
  for (const skill of skills) {
    const domain = domainOf(skill)
    if (!domain) continue
    groups.set(domain, [...(groups.get(domain) ?? []), skill])
  }
  return DOMAIN_ORDER.filter((domain) => groups.has(domain)).map((domain) => ({
    domain,
    skills: groups.get(domain) ?? [],
  }))
}
