import { PluginPreview } from '@/components/plugin-preview'
import type { Plugin } from '@/lib/data'
import { ArrowUpRight, Blocks } from 'lucide-react'
import { FeatureSlab } from 'pivoshenko.ui'

type ShowcaseProps = {
  plugin: Plugin
}

export function PluginShowcase({ plugin }: ShowcaseProps) {
  const href = `${plugin.source}/tree/main/${plugin.path}`

  return (
    <FeatureSlab
      eyebrow={
        <>
          <Blocks
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className="text-accent"
          />
          {plugin.host} plugin
        </>
      }
      title={plugin.name}
      body={plugin.description}
      tags={[
        ...(plugin.version ? [`v${plugin.version}`] : []),
        ...plugin.platforms,
      ]}
      link={
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group type-meta fg-subtle hover-primary focus-ring inline-flex items-center gap-1.5 rounded-sm no-underline transition-colors duration-fast"
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
      }
      media={
        plugin.preview ? (
          <PluginPreview
            src={plugin.preview.src}
            width={plugin.preview.width}
            height={plugin.preview.height}
            name={plugin.name}
            host={plugin.host}
          />
        ) : (
          <span className="border-card block aspect-[16/10] w-full rounded-lg border bg-crust" />
        )
      }
    />
  )
}
