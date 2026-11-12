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
  description: 'Curated AI skills, MCPs and instructions.',
})

export const viewport = siteViewport

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/skills', label: 'Skills' },
  { href: '/mcps', label: 'MCPs' },
  { href: '/instructions', label: 'Instructions' },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SiteLayout
      brand="pivoshenko.ai"
      accent="lavender"
      subAccent="blue"
      navLinks={navLinks}
      field="lake"
      afterShell={<SpeedInsights />}
    >
      {children}
    </SiteLayout>
  )
}
