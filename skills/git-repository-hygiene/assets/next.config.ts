// === next.config.ts ===
// Purpose:  Lands at repository root for next-site variant. Enables React strict mode.
// Tokens:   none
// Override: Add `transpilePackages: [...]` for any git-tag-pinned shared packages this site consumes. Extend with `images`, `redirects`, `experimental`, `pageExtensions` (for MDX), etc.
// === end ===
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
}

export default nextConfig
