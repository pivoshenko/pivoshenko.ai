import {
  siteViewport,
  siteMetadata,
  SiteLayout,
} from 'pivoshenko.ui/next/site-layout'
import './globals.css'

export const metadata = siteMetadata({
  url: 'https://ai.pivoshenko.dev',
  brand: 'pivoshenko.ai',
  title: 'pivoshenko.ai',
  titleTemplate: '%s — pivoshenko.ai',
  description: 'Curated AI skills and MCPs.',
  ogTitle: 'AI Workspace',
  ogDescription: 'Curated AI skills and MCPs',
})

export const viewport = siteViewport

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SiteLayout brand="pivoshenko.ai">{children}</SiteLayout>
}
