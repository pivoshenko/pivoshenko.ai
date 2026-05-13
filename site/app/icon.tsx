import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'
export const runtime = 'edge'

export default async function Icon() {
  const font = await fetch(
    new URL(
      'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.ttf',
    ),
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          color: '#fff',
          fontFamily: 'JetBrains Mono',
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}
      >
        VP
      </span>
    </div>,
    {
      ...size,
      fonts: [{ name: 'JetBrains Mono', data: font, weight: 700 }],
    },
  )
}
