import { CatalogHero } from '@/components/catalog-hero'
import { SpeedInsights } from '@vercel/speed-insights/next'
import {
  SiteLayout,
  siteMetadata,
  siteViewport,
} from 'pivoshenko.ui/next/site-layout'
import './globals.css'

export const metadata = siteMetadata({
  url: 'https://ai.pivoshenko.dev',
  brand: 'pivoshenko.ai',
  title: 'pivoshenko.ai',
  titleTemplate: '%s - pivoshenko.ai',
  description: 'Curated AI skills, MCPs, instructions and plugins.',
  ogTitle: 'AI Workspace',
  ogDescription: 'Curated AI skills, MCPs, instructions and plugins',
})

export const viewport = siteViewport

// The nav doubles as the page's table of contents - Nav scroll-spies any link
// whose href is a fragment, so these four ids have to exist in the catalog
const navLinks = [
  { href: '#filters', label: 'Filters' },
  { href: '#skills', label: 'Skills' },
  { href: '#mcps', label: 'MCPs' },
  { href: '#instructions', label: 'Instructions' },
  { href: '#plugins', label: 'Plugins' },
  { href: '#archived', label: 'Archived' },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SiteLayout
      brand="pivoshenko.ai"
      accent="peach"
      navLinks={navLinks}
      hero={<CatalogHero />}
      afterShell={<SpeedInsights />}
    >
      {children}
    </SiteLayout>
  )
}
