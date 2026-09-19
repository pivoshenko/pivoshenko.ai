// Copies the repository's preview screenshots into public/ before a build.
//
// They live in ../assets so the README can link them, and Next only serves what
// is under public/. A symlink would work locally but is not something the
// deployment's static-asset upload can be relied on to follow, and committing a
// second copy of a 700KB PNG is worse - so the copy happens at build time and
// public/previews is gitignored.

import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const from = join(siteRoot, '..', 'assets')
const to = join(siteRoot, 'public', 'previews')

mkdirSync(to, { recursive: true })

const images = readdirSync(from).filter((name) => name.endsWith('.png'))
for (const name of images) copyFileSync(join(from, name), join(to, name))

console.log(`Synced ${images.length} preview image(s) -> public/previews`)
