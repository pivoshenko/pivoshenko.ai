import preset, { withUiContent } from 'pivoshenko.ui/tailwind-preset/site'
import type { Config } from 'tailwindcss'

const config: Config = {
  presets: [preset],
  content: withUiContent([
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ]),
}

export default config
