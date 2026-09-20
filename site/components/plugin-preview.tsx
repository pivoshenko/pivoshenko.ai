'use client'

import { Expand } from 'lucide-react'
import Image from 'next/image'
import { Dialog } from 'pivoshenko.ui'
import { useState } from 'react'

type PluginPreviewProps = {
  src: string
  width: number
  height: number
  name: string
  host: string
}

export function PluginPreview({
  src,
  width,
  height,
  name,
  host,
}: PluginPreviewProps) {
  const [open, setOpen] = useState(false)
  const alt = `${name} running`

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View the ${name} screenshot`}
        className="focus-ring group relative block w-full cursor-zoom-in rounded-md"
      >
        {/* the capture already carries a window chrome, so it needs no frame */}
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 640px) 100vw, 640px"
          loading="lazy"
          className="block h-auto w-full"
        />
        <span
          aria-hidden="true"
          className="fg-subtle border-card absolute right-3 bottom-3 inline-grid h-7 w-7 place-items-center rounded-sm border bg-bg-surface opacity-0 transition-opacity duration-fast group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        >
          <Expand size={14} strokeWidth={2} />
        </span>
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        eyebrow={`${host} plugin`}
        title={name}
        className="w-[min(72rem,calc(100vw-2rem))]"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 1152px) 100vw, 1152px"
          className="block h-auto w-full rounded-md"
        />
      </Dialog>
    </>
  )
}
