import type { Plugin } from '@/lib/data'
import { ArrowUpRight, Blocks } from 'lucide-react'
import { Tag, Tags } from 'pivoshenko.ui'

type ShowcaseProps = {
  plugin: Plugin
}

// A plugin is a whole running application rather than a prompt fragment, so it
// gets a landing-page slab. The screenshot is a dense terminal UI at native
// resolution - beside a column of copy it is unreadable, so it takes the full
// width of the page and the copy sits above it
export function PluginShowcase({ plugin }: ShowcaseProps) {
  const href = `${plugin.source}/tree/main/${plugin.path}`

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p className="type-label fg-subtle flex items-center gap-2">
            <Blocks
              size={14}
              strokeWidth={2}
              aria-hidden="true"
              className="text-accent"
            />
            {plugin.host} plugin
          </p>

          <h3 className="type-display fg-title mt-3 text-2xl leading-tight">
            {plugin.name}
          </h3>

          <p className="type-body fg-body mt-3 max-w-[64ch]">
            {plugin.description}
          </p>
        </div>

        <Tags>
          {plugin.version && <Tag>v{plugin.version}</Tag>}
          {plugin.platforms.map((platform) => (
            <Tag key={platform}>{platform}</Tag>
          ))}
        </Tags>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group focus-ring block"
      >
        {plugin.preview ? (
          <img
            src={plugin.preview}
            alt={`${plugin.name} running`}
            loading="lazy"
            className="border-card w-full rounded-lg border shadow-float transition-colors duration-base ease-out group-hover:border-accent"
          />
        ) : (
          <span className="border-card block aspect-[16/10] w-full rounded-lg border bg-crust" />
        )}
        <span className="type-meta fg-subtle group-hover:text-accent mt-3 flex items-center gap-1.5 transition-colors duration-fast">
          <span aria-hidden="true" className="text-accent">
            {'//'}
          </span>
          {plugin.path}
          <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
        </span>
      </a>
    </article>
  )
}
