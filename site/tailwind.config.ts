import morokPreset from 'pivoshenko.ui/tailwind-preset'
import type { Config } from 'tailwindcss'

const config: Config = {
  presets: [morokPreset],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // next/font assigns JetBrains Mono via the CSS variable in app/layout.tsx;
      // this overrides the preset's system-font fallback for the actual font loader.
      fontFamily: {
        sans: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular'],
      },
    },
  },
}

export default config
