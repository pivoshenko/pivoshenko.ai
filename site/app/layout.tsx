import { Footer } from '@/components/footer'
import { Nav } from '@/components/nav'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { JetBrains_Mono } from 'next/font/google'
import { ScrollToTop } from 'pivoshenko.ui'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: {
    template: '%s — pivoshenko.ai',
    default: 'pivoshenko.ai — agents workspace',
  },
  description:
    'Curated AI skills and MCP servers, synced via Kasetto into the pivoshenko.ai workspace.',
  openGraph: {
    title: 'pivoshenko.ai — agents workspace',
    description:
      'Curated AI skills and MCP servers, synced via Kasetto into the pivoshenko.ai workspace.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'pivoshenko.ai — agents workspace',
    description:
      'Curated AI skills and MCP servers, synced via Kasetto into the pivoshenko.ai workspace.',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={jetbrainsMono.variable}
    >
      <body className="bg-stone-50 text-stone-900 dark:bg-black dark:text-stone-100 font-mono antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col">
            <Nav />
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
              {children}
            </main>
            <Footer />
          </div>
          <ScrollToTop />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
