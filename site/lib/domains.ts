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
