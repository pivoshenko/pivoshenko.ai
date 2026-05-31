import { createOgImage } from 'pivoshenko.ui/next/opengraph-image'

export const alt = 'pivoshenko.ai'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'edge'

export default createOgImage({
  brand: 'pivoshenko.ai',
  title: 'AI Workspace',
  subtitle: 'Curated AI skills and MCPs',
  domain: 'ai.pivoshenko.dev',
})
