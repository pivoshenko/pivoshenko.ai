import type { Domain } from '@/lib/domains'
import {
  Bot,
  Cloud,
  GitBranch,
  GitFork,
  Laptop,
  type LucideIcon,
  PenLine,
  Sparkles,
  SquareCheck,
} from 'lucide-react'

// Shared by the map's domain nodes and by every card filed under them, so a
// card and the node it belongs to are recognisably the same thing
export const domainIcon: Record<Domain, LucideIcon> = {
  git: GitBranch,
  spec: SquareCheck,
  writing: PenLine,
  cloud: Cloud,
  macos: Laptop,
  agents: Bot,
}

// An own skill outside the six domains, and anything pulled from upstream:
// the fork marks provenance, which is the only thing they have in common
export const FALLBACK_ICON = Sparkles
export const EXTERNAL_ICON = GitFork
