import { loadCatalog } from '@/lib/data'
import type { MetadataRoute } from 'next'

const url = 'https://ai.pivoshenko.dev'

const newest = (items: { updated_at?: string }[]) =>
  items.reduce<string | undefined>(
    (max, { updated_at }) =>
      updated_at && (!max || updated_at > max) ? updated_at : max,
    undefined,
  )

export default function sitemap(): MetadataRoute.Sitemap {
  const { skills, instructions } = loadCatalog()
  const skillsAt = newest(skills)
  const instructionsAt = newest(instructions)
  const overall = [skillsAt, instructionsAt].filter(Boolean).sort().pop()
  return [
    { url, lastModified: overall },
    { url: `${url}/skills`, lastModified: skillsAt },
    { url: `${url}/mcps` },
    { url: `${url}/instructions`, lastModified: instructionsAt },
  ]
}
