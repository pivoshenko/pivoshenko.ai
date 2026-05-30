import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { JetBrains_Mono } from 'next/font/google'
import { PageShell } from 'pivoshenko.ui'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://ai.pivoshenko.dev'),
  title: {
    template: '%s — pivoshenko.ai',
    default: 'pivoshenko.ai',
  },
  description: 'Curated AI skills and MCPs.',
  openGraph: {
    type: 'website',
    url: 'https://ai.pivoshenko.dev',
    siteName: 'pivoshenko.ai',
    title: 'pivoshenko.ai',
    description: 'Curated AI skills and MCPs.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'pivoshenko.ai',
    description: 'Curated AI skills and MCPs.',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={jetbrainsMono.variable}
    >
      <body className="bg-stone-50 text-stone-900 dark:bg-black dark:text-stone-100 font-mono antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PageShell brand="pivoshenko.ai">{children}</PageShell>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
