import { createOgImage } from 'pivoshenko.ui/next/opengraph-image'

export const alt = 'pivoshenko.ai'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default createOgImage({
  brand: 'Volodymyr Pivoshenko',
  title: 'AI Workspace',
  subtitle: 'Curated AI skills, MCPs, instructions and plugins',
  domain: 'ai.pivoshenko.dev',
  accent: 'lavender',
})
