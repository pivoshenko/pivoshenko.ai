import type { Plugin } from '@/lib/data'
import { ArrowUpRight, Blocks } from 'lucide-react'
import { Tag, Tags } from 'pivoshenko.ui'

type ShowcaseProps = {
  plugin: Plugin
}

export function PluginShowcase({ plugin }: ShowcaseProps) {
  const href = `${plugin.source}/tree/main/${plugin.path}`

  return (
    <article className="grid items-center gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)]">
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

        <h3 className="type-display fg-title mt-3 text-xl leading-tight">
          {plugin.name}
        </h3>

        <p className="type-body fg-body mt-3">{plugin.description}</p>

        <Tags className="mt-4">
          {plugin.version && <Tag>v{plugin.version}</Tag>}
          {plugin.platforms.map((platform) => (
            <Tag key={platform}>{platform}</Tag>
          ))}
        </Tags>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group type-meta fg-subtle hover-primary focus-ring mt-5 inline-flex items-center gap-1.5 rounded-sm no-underline transition-colors duration-fast"
        >
          <span aria-hidden="true" className="text-accent">
            {'//'}
          </span>
          {plugin.path}
          <ArrowUpRight
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className="transition-[color,transform] duration-base ease-out group-hover:translate-x-0.5 group-hover:text-accent motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          />
        </a>
      </div>

      {/* Not a link: the path above already points at the same place, and a
          second one carrying only an image is a duplicate with nothing for a
          screen reader to read. No frame of our own either - the screenshot
          already carries a window chrome, and a border around it reads as two */}
      <div className="overflow-hidden rounded-md">
        {plugin.preview ? (
          <img
            src={plugin.preview}
            alt={`${plugin.name} running`}
            loading="lazy"
            className="block w-full"
          />
        ) : (
          <span className="border-card block aspect-[16/10] w-full rounded-lg border bg-crust" />
        )}
      </div>
    </article>
  )
}
