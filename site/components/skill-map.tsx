'use client'

import type { Skill } from '@/lib/data'
import { type Domain, groupByDomain } from '@/lib/domains'
import {
  ArrowUpRight,
  Bot,
  Cloud,
  Cpu,
  GitBranch,
  Laptop,
  type LucideIcon,
  PenLine,
  Sparkles,
  SquareCheck,
} from 'lucide-react'
import type { FlowColumn, FlowLink } from 'pivoshenko.ui'
import { Dialog, FlowMap, Tag, TagButton, Tags } from 'pivoshenko.ui'
import { useMemo, useState } from 'react'
import { domainIcon } from './domain-icon'

type SkillMapProps = {
  skills: Skill[]
}

// The third column holds one domain at a time rather than all twenty-one
// skills: a column that tall stops being a diagram and starts being a list,
// and the page already has a list underneath
export function SkillMap({ skills }: SkillMapProps) {
  const groups = useMemo(
    () => groupByDomain(skills.filter((skill) => skill.local)),
    [skills],
  )

  const [domain, setDomain] = useState<Domain | undefined>(
    () => groups[0]?.domain,
  )
  const [opened, setOpened] = useState<Skill | null>(null)

  const shown = groups.find((group) => group.domain === domain)

  const { columns, links } = useMemo(() => {
    const columns: FlowColumn[] = [
      {
        id: 'you',
        nodes: [
          {
            id: 'you',
            label: 'you',
            icon: <Cpu size={14} strokeWidth={2} aria-hidden="true" />,
            interactive: false,
          },
        ],
      },
      {
        id: 'domains',
        label: 'Domains',
        nodes: groups.map(({ domain: id, skills: members }) => {
          const Icon = domainIcon[id]
          return {
            id: `d:${id}`,
            label: id,
            meta: `${members.length}`,
            icon: <Icon size={14} strokeWidth={2} aria-hidden="true" />,
          }
        }),
      },
      {
        id: 'skills',
        label: shown
          ? `${shown.domain[0].toUpperCase()}${shown.domain.slice(1)} skills`
          : 'Skills',
        grow: true,
        nodes: (shown?.skills ?? []).map((skill) => ({
          id: `s:${skill.id}`,
          label: skill.name,
          icon: <Sparkles size={14} strokeWidth={2} aria-hidden="true" />,
        })),
      },
    ]

    const links: FlowLink[] = [
      ...groups.map(({ domain: id }) => ({ from: 'you', to: `d:${id}` })),
      ...(shown?.skills ?? []).map((skill) => ({
        from: `d:${shown?.domain}`,
        to: `s:${skill.id}`,
      })),
    ]

    return { columns, links }
  }, [groups, shown])

  if (groups.length === 0) return null

  return (
    <section id="map" className="scroll-mt-24 space-y-4">
      <FlowMap
        columns={columns}
        links={links}
        onSelect={(id) => {
          if (id.startsWith('d:')) {
            setDomain(id.slice(2) as Domain)
            return
          }
          setOpened(skills.find((skill) => `s:${skill.id}` === id) ?? null)
        }}
      />

      <SkillDialog skill={opened} onClose={() => setOpened(null)} />
    </section>
  )
}

function SkillDialog({
  skill,
  onClose,
}: {
  skill: Skill | null
  onClose: () => void
}) {
  return (
    <Dialog
      open={skill != null}
      onClose={onClose}
      glyph={<Sparkles size={14} strokeWidth={2} aria-hidden="true" />}
      eyebrow={skill && <SourceLink skill={skill} />}
      title={skill?.name ?? ''}
    >
      <p className="type-body fg-body m-0">{skill?.description}</p>
      {skill && skill.tags.length > 0 && (
        <Tags>
          {skill.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Tags>
      )}
    </Dialog>
  )
}

function SourceLink({ skill }: { skill: Skill }) {
  const leaf = `skills/${skill.slug}`
  return (
    <a
      href={`${skill.source}/tree/main/${leaf}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group fg-subtle hover-primary focus-ring inline-flex items-center gap-1.5 rounded-sm no-underline transition-colors duration-fast"
    >
      <span aria-hidden="true" className="text-accent">
        {'//'}
      </span>
      <span>{`${skill.sourceLabel}/${leaf}`}</span>
      <ArrowUpRight
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className="flex-none transition-[color,transform] duration-base ease-out group-hover:translate-x-0.5 group-hover:text-accent motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      />
    </a>
  )
}
