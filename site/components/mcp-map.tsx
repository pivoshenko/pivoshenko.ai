'use client'

import type { Mcp, McpServer } from '@/lib/data'
import { ArrowUpRight, Bot, Globe, Plug, SquareTerminal } from 'lucide-react'
import { CodeBlock, Dialog, Tag, Tags } from 'pivoshenko.ui'
import { type Ref, useEffect, useRef, useState } from 'react'

// Tailwind cannot express keyframes and the design system's globals.css is not
// ours to edit, so the one animation this component needs lives here
const DRIFT = `
@media (prefers-reduced-motion: no-preference) {
  .mcp-link { animation: mcp-link-drift 2.4s linear infinite }
}
@keyframes mcp-link-drift { to { stroke-dashoffset: -16 } }
`

type Transport = McpServer['transport']

// Fixes the column order, and with it the order of the servers behind each
// transport - grouping them is what keeps the fan from crossing itself
const TRANSPORT_ORDER: Transport[] = ['http', 'stdio']

const TRANSPORT_ICON = { http: Globe, stdio: SquareTerminal }

// What the server actually talks to: the endpoint's host for http, the launched
// binary for stdio - the rest of a URL or an argv line is noise at this size
function reachOf(server: McpServer): string {
  if (server.transport !== 'http') return server.target.split(' ')[0]
  try {
    return new URL(server.target).host
  } catch {
    return server.target
  }
}

// == Geometry ==

type Point = { x: number; y: number }

/** A node's two wiring points, in coordinates relative to the diagram wrapper. */
type Anchor = { in: Point; out: Point }

type Frame = {
  width: number
  height: number
  agent: Anchor
  transports: Partial<Record<Transport, Anchor>>
  servers: Record<string, Anchor>
}

// Horizontal control points, so every curve leaves and arrives flat and the fan
// reads as a bundle rather than a scribble. The floor keeps the short
// agent -> transport hop from collapsing into a straight line
function curve(from: Point, to: Point): string {
  const bend = Math.max(24, (to.x - from.x) / 2)
  return `M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}`
}

type Lit =
  | { kind: 'server'; id: string }
  | { kind: 'transport'; transport: Transport }
  | null

type McpMapProps = {
  mcps: Mcp[]
}

export function McpMap({ mcps }: McpMapProps) {
  const [lit, setLit] = useState<Lit>(null)
  const [opened, setOpened] = useState<Mcp | null>(null)
  const [frame, setFrame] = useState<Frame | null>(null)

  const wrapRef = useRef<HTMLDivElement>(null)
  const agentRef = useRef<HTMLDivElement>(null)
  const transportRefs = useRef(new Map<Transport, HTMLElement>())
  const serverRefs = useRef(new Map<string, HTMLElement>())

  // An external entry is a pointer at somebody else's repository - there is no
  // config of its own to draw a link to, and one with no parseable server has
  // no transport to wire it through
  const entries = mcps
    .filter((mcp) => mcp.local && mcp.servers.length > 0)
    .map((mcp) => ({
      mcp,
      transport: mcp.servers[0].transport,
      reach: reachOf(mcp.servers[0]),
    }))
    .sort(
      (a, b) =>
        TRANSPORT_ORDER.indexOf(a.transport) -
        TRANSPORT_ORDER.indexOf(b.transport),
    )

  const transports = TRANSPORT_ORDER.filter((transport) =>
    entries.some((entry) => entry.transport === transport),
  )

  // The observer watches the wrapper, which covers mount, every resize and any
  // reflow a changed node set causes - so this never needs to re-subscribe
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    let live = true

    const measure = () => {
      const agent = agentRef.current
      const box = wrap.getBoundingClientRect()
      // Below md the wrapper is display:none and every rect is zero - there is
      // nothing to draw, and a zero frame would be a wrong one
      if (!live || !agent || box.width === 0) return

      const anchor = (el: HTMLElement): Anchor => {
        const rect = el.getBoundingClientRect()
        const y = rect.top - box.top + rect.height / 2
        return {
          in: { x: rect.left - box.left, y },
          out: { x: rect.right - box.left, y },
        }
      }

      setFrame({
        width: box.width,
        height: box.height,
        agent: anchor(agent),
        transports: Object.fromEntries(
          Array.from(transportRefs.current, ([key, el]) => [key, anchor(el)]),
        ),
        servers: Object.fromEntries(
          Array.from(serverRefs.current, ([key, el]) => [key, anchor(el)]),
        ),
      })
    }

    const observer = new ResizeObserver(measure)
    observer.observe(wrap)
    // A late webfont reflows every label, and the wrapper itself may not resize
    document.fonts?.ready.then(measure)

    return () => {
      live = false
      observer.disconnect()
    }
  }, [])

  if (entries.length === 0) return null

  const litTransport =
    lit == null
      ? null
      : lit.kind === 'transport'
        ? lit.transport
        : (entries.find((entry) => entry.mcp.id === lit.id)?.transport ?? null)

  const serverLit = (id: string, transport: Transport) =>
    lit?.kind === 'server' ? lit.id === id : litTransport === transport

  return (
    <div className="grid gap-6">
      <style>{DRIFT}</style>

      {/* == Flow == */}

      <div
        ref={wrapRef}
        className="relative mx-auto hidden w-full max-w-5xl md:block"
      >
        {frame && (
          <svg
            viewBox={`0 0 ${frame.width} ${frame.height}`}
            width={frame.width}
            height={frame.height}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0"
          >
            <title>agent to server wiring</title>

            {transports.map((transport) => {
              const to = frame.transports[transport]
              if (!to) return null
              return (
                <Wire
                  key={transport}
                  d={curve(frame.agent.out, to.in)}
                  lit={litTransport === transport}
                />
              )
            })}

            {entries.map((entry) => {
              const from = frame.transports[entry.transport]
              const to = frame.servers[entry.mcp.id]
              if (!from || !to) return null
              return (
                <Wire
                  key={entry.mcp.id}
                  d={curve(from.out, to.in)}
                  lit={serverLit(entry.mcp.id, entry.transport)}
                />
              )
            })}
          </svg>
        )}

        <div className="relative grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-x-20 gap-y-4">
          <span className="type-meta fg-muted text-center">agent</span>
          <span className="type-meta fg-muted text-center">transport</span>
          <span className="type-meta fg-muted">servers</span>

          <div className="flex justify-center">
            <div
              ref={agentRef}
              className="surface-card border-card flex items-center gap-2 rounded-lg border px-5 py-4 shadow-rest"
            >
              <Bot
                size={14}
                strokeWidth={2}
                aria-hidden="true"
                className="text-accent"
              />
              <span className="type-display fg-title text-base leading-none">
                agent
              </span>
            </div>
          </div>

          {/* Stretched so the transports spread against the server column
              rather than bunching at its middle */}
          <div className="flex h-full flex-col justify-around gap-8 self-stretch py-4">
            {transports.map((transport) => (
              <TransportNode
                key={transport}
                transport={transport}
                count={
                  entries.filter((entry) => entry.transport === transport)
                    .length
                }
                lit={litTransport === transport}
                onLight={() => setLit({ kind: 'transport', transport })}
                onDim={() => setLit(null)}
                nodeRef={(el) => {
                  if (el) transportRefs.current.set(transport, el)
                  else transportRefs.current.delete(transport)
                }}
              />
            ))}
          </div>

          <ul className="m-0 grid min-w-0 list-none gap-3 p-0">
            {entries.map((entry) => (
              <li key={entry.mcp.id} className="min-w-0">
                <McpNode
                  mcp={entry.mcp}
                  reach={entry.reach}
                  lit={serverLit(entry.mcp.id, entry.transport)}
                  onOpen={() => setOpened(entry.mcp)}
                  onLight={() => setLit({ kind: 'server', id: entry.mcp.id })}
                  onDim={() => setLit(null)}
                  nodeRef={(el) => {
                    if (el) serverRefs.current.set(entry.mcp.id, el)
                    else serverRefs.current.delete(entry.mcp.id)
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* == Narrow Fallback == */}

      {/* Below 768px the columns have no room, so the same buttons stack. The
          swap is CSS-only, which keeps it correct in the prerender */}
      <ul className="m-0 grid list-none gap-2 p-0 md:hidden">
        {entries.map((entry) => (
          <li key={entry.mcp.id} className="min-w-0">
            <McpNode
              mcp={entry.mcp}
              reach={entry.reach}
              lit={false}
              onOpen={() => setOpened(entry.mcp)}
              onLight={() => {}}
              onDim={() => {}}
            />
          </li>
        ))}
      </ul>

      <Dialog
        open={opened != null}
        onClose={() => setOpened(null)}
        glyph={<Plug size={14} strokeWidth={2} aria-hidden="true" />}
        eyebrow={opened ? `mcps/${opened.name}.json` : undefined}
        title={opened?.name ?? ''}
      >
        {opened && <McpDetail mcp={opened} />}
      </Dialog>
    </div>
  )
}

// == Wire ==

type WireProps = {
  d: string
  lit: boolean
}

function Wire({ d, lit }: WireProps) {
  return (
    <path
      d={d}
      fill="none"
      strokeDasharray="4 4"
      strokeWidth={lit ? 2 : 1}
      className={`mcp-link stroke-accent transition-opacity duration-base ease-out ${
        lit ? 'opacity-100' : 'opacity-25'
      }`}
    />
  )
}

// == Transport ==

type TransportNodeProps = {
  transport: Transport
  count: number
  lit: boolean
  onLight: () => void
  onDim: () => void
  nodeRef: Ref<HTMLButtonElement>
}

function TransportNode({
  transport,
  count,
  lit,
  onLight,
  onDim,
  nodeRef,
}: TransportNodeProps) {
  const Icon = TRANSPORT_ICON[transport]
  const state = lit
    ? 'border-accent -translate-y-0.5 shadow-lift motion-reduce:translate-y-0'
    : ''

  return (
    <button
      ref={nodeRef}
      type="button"
      onMouseEnter={onLight}
      onMouseLeave={onDim}
      onFocus={onLight}
      onBlur={onDim}
      className={`focus-ring bg-bg-raised border-card flex w-full items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 shadow-rest transition duration-base ease-out ${state}`}
    >
      <Icon
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className={lit ? 'text-accent' : 'fg-subtle'}
      />
      <span className="type-label fg-title">{transport}</span>
      <span className="type-meta fg-muted">
        {count} {count === 1 ? 'server' : 'servers'}
      </span>
    </button>
  )
}

// == Node ==

type McpNodeProps = {
  mcp: Mcp
  reach: string
  lit: boolean
  onOpen: () => void
  onLight: () => void
  onDim: () => void
  nodeRef?: Ref<HTMLButtonElement>
}

function McpNode({
  mcp,
  reach,
  lit,
  onOpen,
  onLight,
  onDim,
  nodeRef,
}: McpNodeProps) {
  const state = lit
    ? 'border-accent -translate-y-0.5 shadow-lift motion-reduce:translate-y-0'
    : ''

  return (
    <button
      ref={nodeRef}
      type="button"
      onClick={onOpen}
      onMouseEnter={onLight}
      onMouseLeave={onDim}
      onFocus={onLight}
      onBlur={onDim}
      className={`focus-ring surface-card border-card flex w-full cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left shadow-rest transition duration-base ease-out ${state}`}
    >
      <Plug
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className={`shrink-0 ${lit ? 'text-accent' : 'fg-subtle'}`}
      />
      <span className="type-label fg-title whitespace-nowrap">{mcp.name}</span>
      <span className="type-meta fg-muted ml-auto min-w-0 truncate pl-3">
        {reach}
      </span>
    </button>
  )
}

// == Detail ==

type McpDetailProps = {
  mcp: Mcp
}

function McpDetail({ mcp }: McpDetailProps) {
  return (
    <>
      <ul className="m-0 grid list-none gap-3 p-0">
        {mcp.servers.map((server) => (
          <li
            key={server.name}
            className="surface-sunken grid gap-2 rounded p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="type-label fg-title">{server.name}</span>
              <Tag>
                <span className="inline-flex items-center gap-1.5">
                  {server.transport === 'http' ? (
                    <Globe size={14} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <SquareTerminal
                      size={14}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  )}
                  {server.transport}
                </span>
              </Tag>
            </div>

            <p className="fg-body m-0 font-mono text-[13px] leading-5 [overflow-wrap:anywhere]">
              {server.target}
            </p>

            {server.secrets.length > 0 && (
              <Tags>
                {server.secrets.map((secret) => (
                  <Tag key={secret}>{secret}</Tag>
                ))}
              </Tags>
            )}
          </li>
        ))}
      </ul>

      {mcp.config && (
        <CodeBlock label={`mcps/${mcp.name}.json`} code={mcp.config} />
      )}

      <a
        href={`${mcp.source}/tree/main/mcps/${mcp.name}.json`}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-ring type-meta fg-subtle inline-flex items-center gap-1.5 transition-colors duration-fast hover:text-accent"
      >
        <span aria-hidden="true" className="text-accent">
          {'//'}
        </span>
        {mcp.sourceLabel}
        <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
      </a>
    </>
  )
}
