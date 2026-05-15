import Link from 'next/link'
import { Logo } from 'pivoshenko.ui'
import { ThemeToggle } from './theme-toggle'

export function Nav() {
  return (
    <header className="w-full border-b border-ui">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="type-logo fg-primary hover:opacity-60 transition-opacity inline-flex items-center gap-2"
        >
          <Logo />
          pivoshenko.ai
        </Link>

        <ThemeToggle />
      </nav>
    </header>
  )
}
