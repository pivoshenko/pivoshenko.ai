#!/usr/bin/env node
// Validates instructions/ and archive/instructions/. Higher stakes than a skill:
// Kasetto syncs each live file into ~/.claude/CLAUDE.md as a managed block, so a
// broken one changes every agent session everywhere

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  TODAY,
  checkFields,
  checkPunctuation,
  createReport,
  parseFrontmatter,
} from './lib.mjs'

const ROOT = process.cwd()
const report = createReport('instructions')
let count = 0

for (const base of ['instructions', 'archive/instructions']) {
  const dir = join(ROOT, base)
  if (!existsSync(dir)) continue
  const live = base === 'instructions'

  for (const entry of readdirSync(dir).sort()) {
    if (entry.startsWith('.')) continue
    const rel = `${base}/${entry}`
    report.file(rel)

    if (!entry.endsWith('.md')) {
      report.err('stray file, every entry must be a .md instruction')
      continue
    }

    count++
    const slug = entry.replace(/\.md$/, '')
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
      report.err(`filename "${entry}" is not lowercase kebab-case`)
    }

    const text = readFileSync(join(dir, entry), 'utf8')
    const { data, error } = parseFrontmatter(text)
    if (error) {
      report.err(error)
      continue
    }

    checkFields(data, report, { today: TODAY })

    // Conventions apply to live rules only: archive is frozen, so drift there
    // is a fact about the past rather than something to fix
    if (live) {
      if (typeof data.name === 'string' && slugify(data.name) !== slug) {
        report.warn(`"name" is "${data.name}" but the file is "${entry}"`)
      }
      if (typeof data.description === 'string' && !/^Guardrail\b/.test(data.description)) {
        report.warn('"description" does not open with "Guardrail", the house convention')
      }
      checkPunctuation(rel, text, report)
    }
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

report.finish(count, 'instructions')
