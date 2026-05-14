import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular'],
      },
      colors: {
        morok: {
          base: '#20273a',
          mantle: '#1a2031',
          crust: '#13182a',
          lavender: '#b4bcfa',
          blue: '#87adf6',
          sapphire: '#7cc5e6',
          sky: '#90d8e6',
          teal: '#89d3c8',
          green: '#a6d7a2',
          peach: '#f6ae85',
          mauve: '#c6a0f6',
          pink: '#f4b8e4',
        },
      },
    },
  },
}

export default config
