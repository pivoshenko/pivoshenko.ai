import type { MetadataRoute } from 'next'

const url = 'https://ai.pivoshenko.dev'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${url}/sitemap.xml`,
    host: url,
  }
}
