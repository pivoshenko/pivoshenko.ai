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

// Three catalog routes plus the landing's plugin section. Nav scroll-spies a
// fragment entry, but only while the reader is on the route it belongs to
const navLinks = [
  { href: '/skills', label: 'Skills' },
  { href: '/mcps', label: 'MCPs' },
  { href: '/instructions', label: 'Instructions' },
  { href: '/#plugins', label: 'Plugins' },
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
      afterShell={<SpeedInsights />}
    >
      {children}
    </SiteLayout>
  )
}
