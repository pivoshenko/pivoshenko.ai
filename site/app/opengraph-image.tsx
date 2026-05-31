import {
  createOgImage,
  ogContentType,
  ogRuntime,
  ogSize,
} from 'pivoshenko.ui/next/opengraph-image'

export const alt = 'pivoshenko.ai'
export const size = ogSize
export const contentType = ogContentType
export const runtime = ogRuntime

export default createOgImage({
  brand: 'pivoshenko.ai',
  title: 'AI Workspace',
  subtitle: 'Curated AI skills and MCPs',
  domain: 'ai.pivoshenko.dev',
})
