'use client'

import type { Mcp, McpServer } from '@/lib/data'
import { ArrowUpRight, Cpu, Globe, Plug, SquareTerminal } from 'lucide-react'
import type { FlowColumn, FlowLink } from 'pivoshenko.ui'
import { CodeBlock, Dialog, FlowMap, Tag, Tags } from 'pivoshenko.ui'
import { useMemo, useState } from 'react'

type Transport = McpServer['transport']

const TRANSPORT_ORDER: Transport[] = ['http', 'stdio']

const transportIcon: Record<Transport, typeof Globe> = {
  http: Globe,
  stdio: SquareTerminal,
}

// What a server actually reaches: the endpoint's host for http, the launched
// binary for stdio. The full target is in the config panel
function reachOf(server: McpServer) {
  if (server.transport !== 'http') return server.target.split(/\s+/)[0] ?? ''
  try {
    return new URL(server.target).host
  } catch {
    return server.target
  }
}

type McpMapProps = {
  mcps: Mcp[]
}

export function McpMap({ mcps }: McpMapProps) {
  const [opened, setOpened] = useState<Mcp | null>(null)

  const local = useMemo(
    () => mcps.filter((mcp) => mcp.local && mcp.servers.length > 0),
    [mcps],
  )

  const { columns, links } = useMemo(() => {
    // sorting by transport groups each server behind its own transport node,
    // which is what keeps the fan from crossing itself
    const entries = [...local].sort(
      (a, b) =>
        TRANSPORT_ORDER.indexOf(a.servers[0].transport) -
        TRANSPORT_ORDER.indexOf(b.servers[0].transport),
    )
    const present = TRANSPORT_ORDER.filter((transport) =>
      entries.some((mcp) => mcp.servers[0].transport === transport),
    )

    const columns: FlowColumn[] = [
      {
        id: 'agent',
        nodes: [
          {
            id: 'agent',
            label: 'agent',
            icon: <Cpu size={14} strokeWidth={2} aria-hidden="true" />,
            interactive: false,
          },
        ],
      },
      {
        id: 'transport',
        label: 'Transport',
        nodes: present.map((transport) => {
          const count = entries.filter(
            (mcp) => mcp.servers[0].transport === transport,
          ).length
          const Icon = transportIcon[transport]
          return {
            id: `t:${transport}`,
            label: transport,
            meta: `${count} server${count === 1 ? '' : 's'}`,
            icon: <Icon size={14} strokeWidth={2} aria-hidden="true" />,
            interactive: false,
          }
        }),
      },
      {
        id: 'servers',
        label: 'Servers',
        grow: true,
        nodes: entries.map((mcp) => ({
          id: `m:${mcp.name}`,
          label: mcp.name,
          meta: reachOf(mcp.servers[0]),
          icon: <Plug size={14} strokeWidth={2} aria-hidden="true" />,
        })),
      },
    ]

    const links: FlowLink[] = [
      ...present.map((transport) => ({
        from: 'agent',
        to: `t:${transport}`,
      })),
      ...entries.map((mcp) => ({
        from: `t:${mcp.servers[0].transport}`,
        to: `m:${mcp.name}`,
      })),
    ]

    return { columns, links }
  }, [local])

  if (local.length === 0) return null

  return (
    <>
      <FlowMap
        columns={columns}
        links={links}
        onSelect={(id) =>
          setOpened(local.find((mcp) => `m:${mcp.name}` === id) ?? null)
        }
      />
      <McpDialog mcp={opened} onClose={() => setOpened(null)} />
    </>
  )
}

// == Config Panel ==

function McpDialog({ mcp, onClose }: { mcp: Mcp | null; onClose: () => void }) {
  return (
    <Dialog
      open={mcp != null}
      onClose={onClose}
      glyph={<Plug size={14} strokeWidth={2} aria-hidden="true" />}
      eyebrow={mcp && <SourceLink mcp={mcp} />}
      title={mcp?.name ?? ''}
    >
      {mcp?.servers.map((server) => (
        <div key={server.name} className="grid gap-2">
          <Tags>
            <Tag tone="info">{server.transport}</Tag>
            {server.secrets.map((secret) => (
              <Tag key={secret} tone="warning">
                {secret}
              </Tag>
            ))}
          </Tags>
          <p className="type-meta fg-body m-0 [overflow-wrap:anywhere]">
            {server.target}
          </p>
        </div>
      ))}
      {mcp?.config && (
        <CodeBlock label={`mcps/${mcp.name}.json`} code={mcp.config} />
      )}
    </Dialog>
  )
}

function SourceLink({ mcp }: { mcp: Mcp }) {
  return (
    <a
      href={`${mcp.source}/tree/main/mcps/${mcp.name}.json`}
      target="_blank"
      rel="noopener noreferrer"
      className="group fg-subtle hover-primary focus-ring inline-flex items-center gap-1.5 rounded-sm no-underline transition-colors duration-fast"
    >
      <span aria-hidden="true" className="text-accent">
        {'//'}
      </span>
      <span>{`${mcp.sourceLabel}/mcps/${mcp.name}.json`}</span>
      <ArrowUpRight
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className="flex-none transition-[color,transform] duration-base ease-out group-hover:translate-x-0.5 group-hover:text-accent motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      />
    </a>
  )
}
