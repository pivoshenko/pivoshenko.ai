import { ImageResponse } from 'next/og'

export const alt = 'pivoshenko.ai'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'edge'

export default async function OpengraphImage() {
  const font = await fetch(
    new URL(
      'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.ttf',
    ),
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#000',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        fontFamily: 'JetBrains Mono',
      }}
    >
      <div style={{ display: 'flex', fontSize: 28, color: '#8a8a85' }}>
        pivoshenko.dev
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'flex',
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: '-2px',
            color: '#c7b07a',
          }}
        >
          AI Workspace
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 36,
            color: '#d4d4d0',
            lineHeight: 1.3,
            maxWidth: 980,
          }}
        >
          Curated AI skills and MCPs.
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 24,
          color: '#8a8a85',
        }}
      >
        <span>pivoshenko.dev</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'JetBrains Mono', data: font, weight: 700 },
        { name: 'JetBrains Mono', data: font, weight: 400 },
      ],
    },
  )
}
